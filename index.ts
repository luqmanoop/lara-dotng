import puppeteer from 'puppeteer';
import Twit from 'twit';
import 'dotenv/config';
import { TweetObj } from './interface';

const t = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: true
});

const appName = process.env.APP_NAME;
const stream = t.stream('statuses/filter', { track: `@${appName}` });

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']
  });

  stream.on('tweet', tweet => getDirections(tweet, browser));
  stream.on('error', console.log);
})();

async function getDirections(tweet: TweetObj, browser: puppeteer.Browser) {
  let destination = getDestinationFromTweet(tweet.text);
  if (!destination) return;

  let page = await browser.newPage();
  page.setRequestInterception(true);
  page.on('request', optimizeRequests);

  try {
    let selector = 'input#chatinput';
    await page.goto('https://lara.ng/');
    await page.waitForSelector(selector);
    await page.type(selector, destination);
    await page.waitFor(500);
    await page.type(selector, String.fromCharCode(13));

    let response = await page.waitForResponse(fromLara);
    let [parsedDirections, going] = parseDirections(await response.json());

    await sendDirectionsToDM(parsedDirections, tweet.user.id_str);
    await replyTweet(tweet, going);
  } catch (error) {
    console.log('error', error);
  } finally {
    await page.close();
  }
}

function fromLara(response: puppeteer.Response) {
  return (
    response.url().includes('https://convers-e.com/rp/laraqtx?Query') &&
    response.status() === 200 &&
    parseInt(response.headers()['content-length'], 10) > 0
  );
}

function getDestinationFromTweet(tweetText: string) {
  let matches = tweetText.match(/(from .+ to .+)/gi);
  return matches ? matches[0].toLowerCase() : null;
}

function optimizeRequests(request: puppeteer.Request) {
  let expensiveResources = ['image', 'stylesheet', 'font'];
  return expensiveResources.includes(request.resourceType())
    ? request.abort()
    : request.continue();
}

function parseDirections(directions: any): string[] {
  let routes: any[] = directions[1].Legs[0];
  let parsedDirection = routes
    .map((route: any) => {
      if (route.Vehicle && route.Vehicle.Type !== 'Walk') {
        let {
          Vehicle: { Type, MinFare },
          HeadSign,
          Start,
          End
        } = route;
        return `\nTake a ${Type}\nFrom: ${Start.Name}\nHeading Toward: ${End.Name}\nGet off at: ${HeadSign}\nPrice: ₦${MinFare}\n`;
      } else {
        if (!route.Info) return `\nWalk to ${route.End.Name}\n`;

        let info = route.Info;
        return `\nWalk to your destination\nTotal Estimate: ₦${
          info.MinFare
        } - ${
          info.MaxFare
        }\n\nEstimated Travel Time: ${info.TravelTime.trim()}`;
      }
    })
    .join('');

  return [directions[0] + '\n' + parsedDirection, directions[0]];
}

// async function getDirections(page: puppeteer.Page) {
//   let response = await page.waitForResponse(
//     response =>
//       response.url().includes('https://convers-e.com/rp/laraqtx?Query') &&
//       response.status() === 200 &&
//       parseInt(response.headers()['content-length'], 10) > 0
//   );
//   return response.json();
// }

async function sendDirectionsToDM(directions: string, recipient_id: string) {
  return t.post('direct_messages/events/new', {
    event: {
      type: 'message_create',
      message_create: {
        target: { recipient_id },
        message_data: { text: directions }
      }
    }
  } as any);
}

function replyTweet(tweet: TweetObj, going: string) {
  return t.post('statuses/update', {
    in_reply_to_status_id: tweet.id_str,
    auto_populate_reply_metadata: true,
    status: `Please CYDM for ${going}`
  } as any);
}
