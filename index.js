function getCookieValue(cookieStr, cookieName) {
  let result = null;
  if (cookieStr) {
    let cookies = cookieStr.split(";");
    cookies.forEach((cookie) => {
      let name = cookie.split("=")[0].trim();
      if (name === cookieName) {
        let cookieVal = cookie.split("=")[1];
        result = cookieVal;
      }
    });
  }
  return result;
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const COOKIE_NAME = "variant";

  // get list of variants
  const { variants } = await (
    await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
  ).json();

  let variantIdx = -1;
  const cookie = request.headers.get("cookie");

  const cookieValue = getCookieValue(cookie, COOKIE_NAME);
  if (cookieValue) {
    variantIdx = parseInt(cookieValue);
  } else {
    // choose a random variant URL from the list
    // can handle a variable number of variants
    const numVariants = variants.length;
    // round up
    variantIdx = Math.floor(Math.random() * numVariants);
  }

  const res = await fetch(variants[variantIdx]);

  const displayVariant = variantIdx + 1

  const newResponse = new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent("A very cool Variant " + displayVariant);
      },
    })
    .on("h1#title", {
      element(element) {
        element.setInnerContent("The new and improved Variant " + displayVariant);
      },
    })
    .on("p#description", {
      element(element) {
        element.setInnerContent("Brand spanking new features!");
      },
    })
    .on("a#url", {
      element(element) {
        element.setInnerContent("Go to jcayabyab.com");
        element.setAttribute("href", "https://www.jcayabyab.com");
      },
    })
    .transform(res);

  if (!cookieValue) {
    // set cookie if not already set
    newResponse.headers.append("Set-Cookie", `${COOKIE_NAME}=${variantIdx};`);
  }

  return newResponse;
}
