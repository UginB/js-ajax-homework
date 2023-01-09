document.addEventListener("DOMContentLoaded", () => {
  const _apiBase = "https://v2.jokeapi.dev/";

  async function getData(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
    });
    return response.json();
  }

  const getSearchRequest = async (word) => {
    const res = await getData(`${_apiBase}joke/Any?contains=${word}`);
    console.log(res);
    if (res.joke) {
      return res.joke;
    } else if (res.message) {
      return res.message;
    } else {
      return `${res.setup} ${res.delivery}`;
    }
  };

  async function loadJokesCategories() {
    const data = await getData(`${_apiBase}categories`);
    return data.categories;
  }

  const form = document.querySelector("#newsForm");
  const input = document.querySelector("#input");
  const suggest = document.querySelector("#suggestList");
  const output = document.querySelector("#output");
  const reset = document.querySelector("#reset");
  const storageArch = [];

  output.textContent = "Loading…";
  loadJokesCategories()
    .then((data) =>
      data.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        suggest.appendChild(option);
        output.textContent = "";
      })
    )
    .catch((e) => {
      output.textContent = `loading error ${e.message}`;
    });

  localStorage.clear();
  localStorage.setItem("searchValue", "[]");

  reset.addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let memoryArr = JSON.parse(localStorage.getItem("searchValue"));
    let newMemoryArr = JSON.stringify([input.value, ...memoryArr]);

    localStorage.setItem("searchValue", newMemoryArr);

    let text = "";

    getSearchRequest(input.value).then((joke) => {
      text += `<li class="output__item">${joke}</li>`;

      output.innerHTML = text;
    });
  });

  window.addEventListener("storage", () => {
    storageArch = [...localStorage.getItem("searchValue")];
  });
});
