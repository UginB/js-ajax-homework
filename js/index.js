document.addEventListener("DOMContentLoaded", () => {
  const _apiBase = "https://api.nytimes.com/svc/";
  const _apiKey = "api-key=v4kDqrpaGUclSouAkG457SGtvpsry2Ri";

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

  const getSearchRequest = async (value) => {
    const res = await getData(
      `${_apiBase}search/v2/articlesearch.json?q=${value}&${_apiKey}`
    );

    return res.response.docs;
  };

  async function loadSaggests() {
    const data = await getData(
      `${_apiBase}topstories/v2/world.json?${_apiKey}`
    );

    let saggArr = [];
    for (let i = 0; i < 5; i++) {
      saggArr.push(data.results[i].title);
    }
    return saggArr;
  }

  function refreshSaggestWords(arr) {
    suggest.innerHTML = "";
    arr.forEach((item) => {
      const option = document.createElement("li");
      option.textContent = item;
      suggest.appendChild(option);
      option.classList.add("saggest__item");
      if (JSON.parse(localStorage.getItem("searchValue")).includes(item)) {
        option.classList.add("visited");
      }
      option.addEventListener("click", () => {
        input.value = item;
        suggest.classList.remove("show");
        suggest.classList.add("hide");
      });
    });
  }

  function createTextElemLi(parentElem, innerText, ...classes) {
    const option = document.createElement("li");
    option.textContent = innerText;
    parentElem.appendChild(option);
    option.classList.add(...classes);
    option.addEventListener("click", () => {
      input.value = innerText;
    });
  }

  function refreshOldRequests(arr) {
    oldRequests.innerHTML = "";
    if (arr.length < 3) {
      arr.forEach((item) => {
        createTextElemLi(oldRequests, item, "oldRequests__item");
      });
    } else {
      for (let i = 0; i < 3; i++) {
        createTextElemLi(oldRequests, arr[i], "oldRequests__item");
      }
    }
  }

  function refreshSagAndReq() {
    let history = JSON.parse(localStorage.getItem("searchValue"));
    let filteredHistory = [];

    if (history.length > 5) {
      for (let i = 0; i < 12; i++) {
        if (!saggestFromAPI.includes(history[i]) && history[i]) {
          filteredHistory.push(history[i]);
        }

        if (filteredHistory.length === 5) break;
      }
    } else {
      filteredHistory = [...history];
    }
    refreshSaggestWords([...new Set([...filteredHistory, ...saggestFromAPI])]);
    refreshOldRequests(history);
  }

  const form = document.querySelector("#newsForm");
  const input = document.querySelector("#input");
  const suggest = document.querySelector(".suggest");
  const output = document.querySelector("#output");
  const reset = document.querySelector("#reset");
  const oldRequests = document.querySelector(".oldRequests__list");
  let saggestFromAPI = [];

  output.textContent = "Загрузка…";

  try {
    if (!localStorage.getItem("searchValue")) {
      localStorage.setItem("searchValue", "[]");
    }
  } catch (e) {
    output.textContent = "Ошибка localStorage";
    throw new Error(e.message);
  }

  loadSaggests()
    .then((data) => {
      data.forEach((sag) => {
        saggestFromAPI.push(sag);
        output.textContent = "";
      });
      refreshSagAndReq();
    })
    .catch((e) => {
      output.textContent = `loading error: ${e.message}`;
    });

  refreshOldRequests([
    ...new Set([...JSON.parse(localStorage.getItem("searchValue"))]),
  ]);

  reset.addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "";
    input.style.backgroundColor = "";
  });

  form.parentElement.addEventListener("click", (e) => {
    if (e.target === input) {
      suggest.classList.add("show");
      suggest.classList.remove("hide");
    } else {
      suggest.classList.remove("show");
      suggest.classList.add("hide");
    }
  });

  input.addEventListener("input", (e) => {
    let saggestArr = [
      ...new Set([
        ...JSON.parse(localStorage.getItem("searchValue")),
        ...saggestFromAPI,
      ]),
    ];

    let newSaggestArr = saggestArr.filter((item) =>
      item.toLowerCase().startsWith(e.target.value.toLowerCase())
    );

    let res = [];
    for (let i = 0; i < 10; i++) {
      if (newSaggestArr[i]) {
        res.push(newSaggestArr[i]);
      }
    }

    refreshSaggestWords(res);

    if (!input.value) {
      refreshSagAndReq();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value) {
      output.textContent = "Ищем новости... Подождите, пожалуйста";
      input.style.backgroundColor = "";

      let memoryArr = JSON.parse(localStorage.getItem("searchValue"));

      let newMemoryArr = [];

      newMemoryArr = JSON.stringify([...new Set([input.value, ...memoryArr])]);

      try {
        window.localStorage.setItem("searchValue", newMemoryArr);
      } catch (e) {
        output.textContent = "Ошибка localStorage";
        throw new Error(e.message);
      }

      let text = "";

      getSearchRequest(input.value)
        .then((news) => {
          if (news.length) {
            news.forEach((item) => {
              text += `<li class="output__item"><a href=${
                item.web_url
              }>${item.abstract.substring(0, 100)}...</a></li>`;
            });
          } else {
            text = "По данному запросу информация не найдена";
          }

          output.innerHTML = text;
        })
        .catch((e) => {
          output.textContent = `loading error: ${e.message}`;
        });

      refreshSagAndReq();
    } else {
      input.style.backgroundColor = "red";
      output.textContent = "введите какое-нибудь слово!";
    }
  });

  window.addEventListener("storage", refreshSagAndReq);
});
