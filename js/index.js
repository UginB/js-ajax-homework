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

  function refreshSaggestWords(arr) {
    suggest.innerHTML = "";
    arr.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      suggest.appendChild(option);
    });
  }

  function refreshOldRequests(arr) {
    oldRequests.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const el = document.createElement("li");
      el.style.listStyleType = "none";
      el.textContent = arr[i];
      oldRequests.appendChild(el);
    }
  }

  function refreshSagAndReq() {
    let oldReqArr = [];
    let lSArr = JSON.parse(localStorage.getItem("searchValue"));
    if (lSArr.length > 5) {
      for (let i = 0; i < 5; i++) {
        oldReqArr.push(lSArr[i]);
      }
    } else {
      oldReqArr = [...lSArr];
    }
    refreshSaggestWords([...new Set([...oldReqArr, ...storageArch])]);
    refreshOldRequests([
      ...new Set([...JSON.parse(localStorage.getItem("searchValue"))]),
    ]);
  }

  const form = document.querySelector("#newsForm");
  const input = document.querySelector("#input");
  const suggest = document.querySelector("#suggestList");
  const output = document.querySelector("#output");
  const reset = document.querySelector("#reset");
  const oldRequests = document.querySelector(".oldRequests__list");
  let storageArch = [];

  output.textContent = "Loading…";
  try {
    loadJokesCategories()
      .then((data) => {
        data.forEach((cat) => {
          if (cat !== "Misc" && cat !== "Spooky") {
            // ДА! это костыль, я не смог найти подходящий АПИ, который нормально давал бы саджесты, эти два слова ничего не выведут в output
            storageArch.push(cat);
            output.textContent = "";
          }
        });
        refreshSaggestWords(storageArch);
      })
      .catch((e) => {
        output.textContent = `loading error ${e.message}`;
      });
  } catch (e) {
    output.textContent = `loading error ${e.message}`;
  }

  localStorage.setItem("searchValue", "[]");

  reset.addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "";
    input.style.backgroundColor = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value) {
      output.textContent = "";
      input.style.backgroundColor = "";

      let memoryArr = JSON.parse(localStorage.getItem("searchValue"));
      let newMemoryArr = JSON.stringify([input.value, ...memoryArr]);
      localStorage.setItem("searchValue", newMemoryArr);

      let text = "";

      try {
        getSearchRequest(input.value)
          .then((joke) => {
            text += `<li class="output__item">${joke}</li>`;

            output.innerHTML = text;
          })
          .catch((e) => {
            output.textContent = `loading error ${e.message}`;
          });
      } catch (e) {
        output.textContent = `loading error ${e.message}`;
      }

      refreshSagAndReq();
    } else {
      input.style.backgroundColor = "red";
      output.textContent = "введите какое-нибудь слово!";
    }
  });

  window.addEventListener("storage", () => {
    refreshSagAndReq();
  });
});
