# Puppeteer based front-end benchmark
## What is the aim of this script?

The aim is to provide some statistical data like mean, max, standard dev etc. when a function in a web application is executed. With this script, you can compute the execution time of a function, or you can use it to see you much time goes from the download of the HTML to the execution time of a function. For example, I have used this script to improve my SEO in a vue.js application by putting the [performance API methods](https://developer.mozilla.org/en-US/docs/Web/API/Performance "look at MDN Web docs") in a specific hook.

Not only that, thanks to Puppeteer API it's able to emulate different client devices and also different network conditions, so it is useful to emulate over the internet network conditions in the same computer where you run the script. But you have to pay attention to replicate the exact server configuration that you use in the production, for example with docker.

### Example of result

![Example of result](https://lh3.googleusercontent.com/CRv0EMMJ9dPl-6_kCxf5KA3Q6OYN4hak1vJpCIMKFN21HxMPDsvwVh3fzldDyjxiQ5YUibERndpgRj_QRfjVZGA2BvRHKdASiM_LRDbLTN1e8aWubDSi64BFxzKftg3XANuAkZflDFk=w2400)

## How does it work?

It works with [performance web api](https://developer.mozilla.org/en-US/docs/Web/API/Performance "look at MDN Web docs"), Puppeteer reads the browser console and then collects all the data and after some iterations computes the statical result. The simulated network condition and device emulation are provided by the puppeteer API's.

## Istructions

⚠️ **Before attempting to use the script you have to make some tweaks in the code of the page you want to test**

First of all, you to install the dependencies with:

```bash
npm install
```

To run the script you have to call the index.js file with node . and set these two **mandatory** arguments _url_ and _name_.

```bash
node . --url http://localhost/ --name example
```

### List of argument

| Argument   | Type     | Action                                                                                                                                                |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| --url      | String   | Set the page you want to test                                                                                                                         |
| --names    | String   | Give's you the result for the corresponding marker name, you can put more than one values                                                             |
| --i        | Integer  | Set the number of iterations, default value 50                                                                                                        |
| --dw       | Floating | Set emulated download speed MB/S, default value 110.24 MB/S                                                                                           |
| --up       | Floating | Set emulated upload speed MB/S, default value 60.13 MB/S                                                                                              |
| --lt       | Integer  | Set emulated latency in ms, default 19 ms                                                                                                             |
| --headless | Boolean  | Set puppeteer in headless mode, default value false                                                                                                   |
| --v        | Boolean  | Verbose mode, print the browser console data in the cli default value true                                                                            |
| --cpu      | Integer  | Simulate cpu throttling, default 1 see [puppeteer](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pageemulatecputhrottlingfactor) API's |
| --nexus    | Boolean  | With true puppeteer emulates the Nexus 5, false if you want set manual values                                                                         |
| --w        | Integer  | **Only with --nexus false**, set the width of the emulated window in px default value 1920                                                            |
| --h        | Integer  | **Only with --nexus false**, set the height of the emulated window in px default value 1080                                                           |
| --mobile   | Boolean  | **Only with --nexus false**, define the type of device to emulate default false                                                                       |

#### Some examples

```bash
node . --url http://localhost/ --names mounted api --i 100 --lt 150 --cpu 4 --dw 1.6384

node . --url http://localhost/fetch-svelte --names Api --i 50 --headless true
```

## Requested code changes for the tested page

As I told before you need to make some changes in the front-end code to use this script. You need to use mark and measure methods in combinations with getEntries, getEntryByName and getEntryByType. For information see [the MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Performance).

```javascript
//set a marker named example 1
performance.mark("example 1");
//set a marker named example 2
perofrmance.mark("example 2");
//compute the difference between example 1 and example 2 and name it as diff
performance.measure("diff", "example 1", "example 2");
// now we print all the entries in the console make sure to run this after the mark and measure methods
performance
  .getEntries()
  .map((entry) => JSON.stringify(entry, null, 2))
  .forEach((json) => console.log(json));
```

You have also to put an element with the id="loaded" using, for example, the script that I leave here, in this way the test script is able to understand that this page is done and is time to pass to the next.

```javascript
var span = document.createElement("span");
span.setAttribute("id", "loaded");
document.body.appendChild(span);
```

#### One example of code that I used on Svelte 3 and on Vue 3

I putted this piece of code on the index.html page of my website, pay attention because this works if you use Vite and its routing system may not work using other bundlers.

```javascript
document.addEventListener("DOMContentLoaded", (event) => {
  const target = document.getElementById("target");
  const observer = new MutationObserver(() => {
    performance.mark("target");
    performance
      .getEntries()
      .map((entry) => JSON.stringify(entry, null, 2))
      .forEach((json) => console.log(json));

    var span = document.createElement("span");
    span.setAttribute("id", "loaded");
    document.body.appendChild(span);
  });

  const config = { attributes: false, childList: true, subtree: true };

  observer.observe(target, config);
});
```

In this example, I'm targeting a table that has data on the tbody that loads asynchronous, so in order to see when the table is completely loaded because it is the latest element that loads on the page that I tested. I used the event listener in order to load the script after the dom is rendered, otherwise when you try to run it will fail because it will not find the element in the dom.
