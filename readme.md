# lara-dotng
> Twitter Bot for the awesome Public Transit Directions Assistant - https://lara.ng

This project doesn't try to reinvent the wheel, instead, wraps an existing solution (lara.ng) to provide public transit directions to Twiitter users.

## Motivation
I've been using lara.ng for a little over 2years but recently followed them on Twitter and I tried to do this (thinking I would get a reply) 👇
![chat lara](https://i.imgur.com/5kGfEPU.png)
That was when it struck me! _There are millions of Nigerians on [Twitter](https://twitter.com), why not make this accessible to them_. Afterall, Lara claims to be a (chat) bot.

## Challenge
If you didn't know already, there is no public API to interface with lara.ng. To have access, you need to submit a request to hello@lara.ng. Never tried that before so I can't say how easy/painful the process is.

## Solution
**No API? No Problem!** [Puppeteer](https://developers.google.com/web/tools/puppeteer) to the rescue!

With puppeteer, I was able to crawl lara.ng, make a request on behalf of the user, intercept its response, parse and send directions to their DM.

### How it works
- A user tweets [@lara_dotng](https://twitter.com/lara_dotng) e.g. `@lara_dotng from takwa bay to maryland`
- Take the destination query i.e. `from takwa bay to maryland`
- Crawl lara.ng
  - submit the query
  - intercept & parse the json response
- send parsed response to (Twitter) user DM
- notify user to check their DM

## Author
[Luqman Olushi (@codeshifu)](https://twitter.com/codeshifu)

## License
This project is licensed under
[MIT](https://github.com/codeshifu/lara-dotng/blob/master/license)
