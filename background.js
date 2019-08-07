
let str = {};

function listener(details) {

    function isJsonRequest(headers_array) {
        let result = false;
        headers_array.forEach(e => {
            if (e.name.toLowerCase() === "content-type"
                && e.value
                && e.value.toLowerCase().includes("json")) {
                    console.info(e.value);
                    result = true;
            }
        });
        return result;
    }

    if (!isJsonRequest(details.responseHeaders)) {
        return {responseHeaders: details.responseHeaders};
    }

    let decoder = new TextDecoder("utf-8");
    let filter = browser.webRequest.filterResponseData(details.requestId);
    filter.onstart = (event) => { str[details.requestId] = {url: details.url, str: ""}; }
    filter.ondata = (event) => {
        str[details.requestId].str += decoder.decode(event.data, {stream: true});
        filter.write(event.data);
    }
    filter.onstop = (event) => {
        console.info("Data receive completed.")
        console.info(str[details.requestId].url);
        if (str[details.requestId].str.includes("image") || str[details.requestId].str.includes("media")) {
            console.log(JSON.parse(str[details.requestId].str));
        }
        delete str[details.requestId];
        filter.close();
    }

    return {responseHeaders: details.responseHeaders};

}


browser.webRequest.onHeadersReceived.addListener(
    listener,
    {urls: ["*://*.twitter.com/*", "*://*.twimg.com/*"]},
    ["responseHeaders", "blocking"]
);
