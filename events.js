import {filterEventList} from "./filter.js";

const eventsDateElem = document.querySelector(".events__date");
const eventAddButtonElem = document.querySelector(".events__addButton");
const eventAddPopupElem = document.querySelector(".events__addPopup");
let eventListObj = {};

//Проверка localStorage или установка тестовых событий
if (localStorage.getItem('eventsList')) {
  eventListObj = JSON.parse(localStorage.getItem('eventsList'));
} else {
  eventListObj = {
    Events: [
      {
        title: "Соревнование по лёгкой атлетике",
        date: "2023-03-15",
        startTime: "14:30",
        duration: "4",
        location: "Бауманская",
        participants: ["Тренер", "Мартышка"],
      },
      {
        title: "Воллейбол",
        date: "2023-03-16",
        startTime: "12:30",
        duration: "1",
        location: "Сокольники",
        participants: ["Саня", "Яна"],
      },
    ],
  };
}

let currentDate = new Date();
// Глобальное состояние это плохо: нет возможности следить за тем кто и как будет менять эту перменную
// Лучше переписать все функции так, чтобы они принимали активную дату аргументом
let activeDate;

// Значение по умолчанию очень смущает, непонятно: ты сначала присваиваешь eventOnDate – activeDate
// А на следующей строке переприсваиваешь их обратно
function renderEvents(eventsOnDate = activeDate) {
  activeDate = eventsOnDate;
  let onDateEventListObj = {
    Events: []
  };

  let filteredList = filterEventList(eventListObj);

  //Проверка на текущую дату
  //
  // Стоит использовать .forEach() и тогда, внутри делать Events.push()
  // Но если используешь .map(), то можно сразу присваивать в массив:
  // onDateEventListObj.Events = filteredList.Events.map()
  // Посмотри получше как работает map
  filteredList.Events.map(item => {
    let itemDate = new Date(item['date']);
    if (eventsOnDate.getDate() === itemDate.getDate()
        && eventsOnDate.getMonth() === itemDate.getMonth()
        && eventsOnDate.getFullYear() === itemDate.getFullYear()) {
      onDateEventListObj.Events.push(item);
    }
  });

  const eventsElem = document.querySelector(".events__list");
  eventsElem.innerHTML = '';

  //Отрисовка собыйти на страницу
  onDateEventListObj.Events.forEach((item) => {
    let event = `<article class="events_listItem eventItem"><div class="eventItem__controlBlock"><span class="eventItem__controlItem btn btn--save collapse"></span><span class="eventItem__controlItem btn btn--edit"></span>
        <span class="eventItem__controlItem btn btn--del"></span>
        </div>
      <p class="eventItem__title">${item.title}</p>                                                             
      <div class="eventItem__row">                                                                                                
      <span class="eventItem__startTime">Время начала: <span class="eventItem__startTimeSpan">${item.startTime}</span></span>                      
      <span class="eventItem__duration">\\ Длительность: <span class="eventItem__durationSpan">${item.duration}</span></span>              
      </div>                                                                                                                      
      <p class="eventItem__location">Место: <span class="eventItem__locationSpan">${item.location}</span></p>                               
      <p class="eventItem__participants">Участники: 
      <span class="eventItem__participantsSpan">${item.participants.join(",")}</span></p></article>`;
    eventsElem.innerHTML += event;
  });

  const editButtons = document.querySelectorAll('.btn--edit');
  const delButtons = document.querySelectorAll('.btn--del');
  const saveButtons = document.querySelectorAll('.btn--save');

  delButtons.forEach( (item, index) => {
    item.addEventListener('click', (e) => {
      e.target.parentElement.parentElement.remove();
      eventListObj.Events.forEach((eventListItem, i) => {
        if (JSON.stringify(eventListItem) === JSON.stringify(onDateEventListObj.Events[index])) {
          eventListObj.Events.splice(i, 1);
          renderEvents(activeDate);
        }
      });
    });
  });

  editButtons.forEach((item, index) => {
    item.addEventListener('click', e => {
      e.preventDefault();
      item.classList.add('collapse');
      saveButtons[index].classList.remove('collapse');
      let currentElem = e.target.parentElement.parentElement,
          currentEventTitleElem = currentElem.querySelector('.eventItem__title'),
          currentEventStartTimeElem = currentElem.querySelector('.eventItem__startTimeSpan'),
          currentEventDurationElem = currentElem.querySelector('.eventItem__durationSpan'),
          currentEventLocationElem = currentElem.querySelector('.eventItem__locationSpan'),
          currentEventParticipantsElem = currentElem.querySelector('.eventItem__participantsSpan');

      currentEventTitleElem.innerHTML = `<input type="text" value="${currentEventTitleElem.textContent}">`;
      currentEventStartTimeElem.innerHTML = `<input type="time" value="${currentEventStartTimeElem.textContent}">`;
      currentEventDurationElem.innerHTML = `<input type="text" value="${currentEventDurationElem.textContent}">`;
      currentEventLocationElem.innerHTML = `<input type="text" value="${currentEventLocationElem.textContent}">`;
      currentEventParticipantsElem.innerHTML = `<input type="text" value="${currentEventParticipantsElem.textContent}">`;

      saveButtons[index].addEventListener('click', (e) => {
        e.preventDefault();
        eventListObj.Events.forEach((eventListItem, i) => {
          // Очень непонятно почему вот тут такое сравнение, вот тут бы помог коментарий
          if (JSON.stringify(eventListItem) === JSON.stringify(onDateEventListObj.Events[index])) {
            eventListObj.Events[i].title = currentEventTitleElem.children[0].value;
            eventListObj.Events[i].startTime = currentEventStartTimeElem.children[0].value;
            eventListObj.Events[i].duration = currentEventDurationElem.children[0].value;
            eventListObj.Events[i].location = currentEventLocationElem.children[0].value;
            eventListObj.Events[i].participants = currentEventParticipantsElem.children[0].value.split(',');

            renderEvents(activeDate);
          }
        });
      });
    });
  });

  localStorage.setItem("eventsList", JSON.stringify(eventListObj));
}

renderEvents(currentDate);

eventsDateElem.innerHTML = currentDate.toLocaleString("ru-ru", {
  month: "long",
  day: "numeric",
});

eventAddButtonElem.addEventListener("click", () => {
  eventAddPopupElem.classList.toggle("collapse");
});

//Добавление нового события
const eventAddPopupFormElem = document.querySelector(".addEventPopup__form");
eventAddPopupFormElem.addEventListener("submit", e => {
  const eventTitleElem = document.querySelector('#event-title');
  const eventDateElem = document.querySelector('#event-date');
  const eventStartTimeElem = document.querySelector('#event-startTime');
  const eventDurationElem = document.querySelector('#event-duration');
  const eventLocationElem = document.querySelector('#event-location');
  const eventParticipantsElem = document.querySelector('#event-participants');
  e.preventDefault();

  eventListObj.Events.push({
    title: eventTitleElem.value,
    date: eventDateElem.value,
    startTime: eventStartTimeElem.value,
    duration: eventDurationElem.value,
    location: eventLocationElem.value,
    participants: eventParticipantsElem.value.split(','),
  });
  renderEvents(activeDate);

});

let startTimeSet = new Set;
let durationSet = new Set;
let locationSet = new Set;
let participantSet = new Set;
eventListObj.Events.map(item => {
  startTimeSet.add(item.startTime);
  durationSet.add(item.duration);
  locationSet.add(item.location);
  participantSet.add(item.participants.join(','));
});

const filterStartTimeElem = document.querySelector('#filterStartTime');
const filterDurationElem = document.querySelector('#filterDuration');
const filterLocationElem = document.querySelector('#filterLocation');
const filterParticipantsElem = document.querySelector('#filterParticipants');
startTimeSet.forEach(item => {
  let startTimeElem = `<option value="${item}" class="startTime__listItem">${item}</option>`;
  filterStartTimeElem.innerHTML += startTimeElem;
});

Array.from(durationSet).sort( (a,b) => a - b).forEach(item => {
  let durationElem = `<option value="${item}" className="duration__listItem">${item}</option>`;
  filterDurationElem.innerHTML += durationElem;
});
locationSet.forEach(item => {
  let locationElem = `<option value="${item}" className="location__listItem">${item}</option>`;
  filterLocationElem.innerHTML += locationElem;
});
participantSet.forEach(item => {
  let participantsElem = `<option value="${item}" className="participants__listItem">${item}</option>`;
  filterParticipantsElem.innerHTML += participantsElem;
});





export { eventsDateElem, renderEvents };
