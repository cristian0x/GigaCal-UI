"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import "./page.css";
import Button from "@mui/material-next/Button";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { green } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/navigation";
import SettingsModal from "../components/modals/SettingsModal";
import DeleteEventModal from "../components/modals/DeleteEventModal";
import EventModal from "../components/modals/EventModal";
import CalendarModal from "../components/modals/CalendarModal";
import DeleteCalendarModal from "../components/modals/DeleteCalendarModal";
import { Calendar } from "../utils/calendar";
import ViewEventModal from "../components/modals/ViewEventModal";
import AddIcon from "@mui/icons-material/Add";

export default function Home() {
  const { push } = useRouter();

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState<any>({
    isCyclic: false,
    allDay: false,
  });

  const [showAddEventModal, setAddEventModal] = useState(false);
  const [showDeleteEventModal, setDeleteEventModal] = useState(false);
  const [showEditEventModal, setEditEventModal] = useState(false);
  const [showViewEventModal, setViewEventModal] = useState(false);
  const [eventModalTitle, setEventModalTitle] = useState<string | null>(null);

  const [allCalendars, setAllCalendars] = useState<Calendar[]>([]);
  const [newCalendar, setNewCalendar] = useState<any>({});

  const [showAddCalendarModal, setAddCalendarModal] = useState(false);
  const [showDeleteCalendarModal, setDeleteCalendarModal] = useState(false);
  const [showEditCalendarModal, setEditCalendarModal] = useState(false);
  const [calendarModalTitle, setCalendarModalTitle] = useState<string | null>(
    null
  );

  const [calendarIdToDelete, setCalendarIdToDelete] = useState<number | null>(
    null
  );
  const [calendarIdToEdit, setCalendarIdToEdit] = useState<number | null>(null);

  const [eventIdToDelete, setEventIdToDelete] = useState<number | null>(null);
  const [eventIdToEdit, setEventIdToEdit] = useState<number | null>(null);
  const [chosenCalendarId, setChosenCalendarId] = useState<number | null>(null);

  const [isSnackbarOpened, setIsSnackbarOpened] = useState<boolean>(false);
  const [showDeleteButton, setShowDeleteButton] = useState<boolean>(false);
  const [pickedRecurDatesInvalid, setPickedRecurDatesInvalid] =
    useState<boolean>(false);
  const [pickedDatesInvalid, setPickedDatesInvalid] = useState<boolean>(false);
  const [pickedTimeInvalid, setPickedTimeInvalid] = useState<boolean>(false);

  const [showSettingsModal, setSettingsModal] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState<any>({});

  const CalendarButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  }));

  useEffect(() => {
    if (allCalendars.length === 0) {
      setAllEvents([]);
      setFilteredEvents([]);
    }
  }, [allCalendars]);

  useEffect(() => {
    if (sessionStorage.getItem("token") === null) {
      push("/signin");
    }
  }, []);

  useEffect(() => {
    if (newEvent.startRecur && newEvent.endRecur) {
      setPickedRecurDatesInvalid(
        dayjs(newEvent.endRecur).isBefore(dayjs(newEvent.startRecur))
      );
    }
    if (newEvent.start && newEvent.end) {
      setPickedDatesInvalid(
        dayjs(newEvent.end).isBefore(dayjs(newEvent.start))
      );
    }
    if (newEvent.startTime && newEvent.endTime) {
      setPickedTimeInvalid(
        dayjs(newEvent.endTime).isBefore(dayjs(newEvent.startTime))
      );
    }
  }, [
    newEvent.start,
    newEvent.end,
    newEvent.startRecur,
    newEvent.endRecur,
    newEvent.startTime,
    newEvent.endTime,
  ]);

  useEffect(() => {
    let draggableEl = document.getElementById("draggable-el");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title");
          let id = eventEl.getAttribute("data");
          let start = eventEl.getAttribute("start");
          return { title, id, start };
        },
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const calendarResponse = await axios.get<Calendar[]>(
          `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/calendars`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        console.log(calendarResponse);
        let sortedCalendars = calendarResponse.data.sort((a, b) => a.id - b.id);
        setAllCalendars(sortedCalendars);
        let firstCalendar = calendarResponse.data[0];
        setChosenCalendarId(firstCalendar.id);

        const eventsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/events`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const clearedAllEvents = eventsResponse.data?.map((event: any) =>
          clearEventFromRecursiveFields(event)
        );
        setAllEvents(clearedAllEvents);

        let filteredEvents = clearedAllEvents.filter(
          (event: any) => event.calendarId === firstCalendar.id
        );
        setFilteredEvents(filteredEvents);

        const settingResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/settings`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const userSettings = settingResponse.data;
        console.log(userSettings);
        setUserSettings(userSettings);
      } catch (error) {
        console.error("Calendars error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (chosenCalendarId !== null) {
      setFilteredEvents(
        allEvents.filter((event: any) => event.calendarId == chosenCalendarId)
      );
    }
  }, [chosenCalendarId]);

  function openSnackbar() {
    setIsSnackbarOpened(true);
  }

  function closeSnackbar() {
    setIsSnackbarOpened(false);
  }

  function moveFromViewingToEditing() {
    setViewEventModal(false);
    setEventModalTitle("Edit event");
    setEditEventModal(true);
  }

  function handleDateClick(arg: { date: Date }) {
    if (chosenCalendarId === null) {
      openSnackbar();
      return;
    }
    const startDate = new Date(arg.date);
    const endDate = new Date(arg.date);
    const endRecur = new Date(arg.date);

    startDate.setHours(8);
    endDate.setHours(9);
    endRecur.setDate(endDate.getDate() + 7);

    setNewEvent({
      ...newEvent,
      start: startDate,
      end: endDate,
      startRecur: startDate,
      endRecur: endRecur,
      startTime: startDate,
      endTime: endDate,
    });
    setShowDeleteButton(false);
    setAddEventModal(true);
    setEventModalTitle("Add event");
  }

  function handleClickEventModal(data: { event: { id: string } }) {
    if (chosenCalendarId === null) {
      openSnackbar();
      return;
    }
    const filteredEvent = allEvents.filter(
      (event) => Number(event.id) === Number(data.event.id)
    )[0];

    setViewEventModal(true);
    setEventModalTitle("Edit event");
    setNewEvent(filteredEvent);
    setEventIdToEdit(Number(data.event.id));
    setEventIdToDelete(Number(data.event.id));
  }

  function handleDeleteCalendarModal(calendar: Calendar) {
    setDeleteCalendarModal(true);
    setCalendarIdToDelete(Number(calendar.id));
  }

  function handleEditCalendarModal(calendar: Calendar) {
    setCalendarModalTitle("Edit calendar");
    setNewCalendar(calendar);
    setCalendarIdToEdit(Number(calendar.id));
    setEditCalendarModal(true);
  }

  async function handleDeleteEvent() {
    setAllEvents(
      allEvents.filter((event) => Number(event.id) !== Number(eventIdToDelete))
    );
    setFilteredEvents(
      filteredEvents.filter(
        (event) => Number(event.id) !== Number(eventIdToDelete)
      )
    );

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/events/${Number(
        eventIdToDelete
      )}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    console.log(response);
    setDeleteEventModal(false);
    setEventIdToDelete(null);
  }

  function handleCloseModal() {
    setAddEventModal(false);
    setEditEventModal(false);
    setDeleteEventModal(false);
    setViewEventModal(false);

    setAddCalendarModal(false);
    setEditCalendarModal(false);
    setDeleteCalendarModal(false);

    setSettingsModal(false);

    setNewEvent({});
    setNewCalendar({});
    setEventModalTitle(null);
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      title: e.target.value,
    });
  };

  const handleUrlStrChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      urlStr: e.target.value,
    });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewEvent({
      ...newEvent,
      description: e.target.value,
    });
  };

  const handleStartChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      start: data.$d.toISOString(),
    });
  };

  const handleEndChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      end: data.$d.toISOString(),
    });
  };

  const handleStartTimeChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      startTime: data.$d.toISOString(),
    });
  };

  const handleEndTimeChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      endTime: data.$d.toISOString(),
    });
  };

  const handleStartRecurennceChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      startRecur: data.$d.toISOString(),
    });
  };

  const handleEndRecurennceChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      endRecur: data.$d.toISOString(),
    });
  };

  const handleIsCyclicChange = (): void => {
    setNewEvent({
      ...newEvent,
      isCyclic: !newEvent.isCyclic,
    });
  };

  const handleAllDayChange = (): void => {
    setNewEvent({
      ...newEvent,
      allDay: !newEvent.allDay,
    });
  };

  const handleCalendarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewCalendar({
      ...newCalendar,
      name: e.target.value,
    });
  };

  const handleDaysChange = (days: string[]): void => {
    setNewEvent({
      ...newEvent,
      daysOfWeek: days,
    });
  };

  function handleAddCalendarModal() {
    setCalendarModalTitle("Add calendar");
    setAddCalendarModal(true);
  }

  function renderEventContent(eventInfo: any) {
    let newTitle = eventInfo.event.title;
    if (newTitle.length >= 15) {
      newTitle = newTitle.slice(0, 12) + "...";
    }
    return <p>{newTitle}</p>;
  }

  function handleEventChangeSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (showEditEventModal) {
      handleEditEventSubmit(e);
    } else {
      handleAddEventSubmit(e);
    }
  }

  function handleChangingTimesFormat(event: any) {
    console.log("START TIME", event.startTime);
    console.log("END TIME", event.endTime);
    event.startTime = String(event.startTime).split(" ")[4];
    event.endTime = String(event.endTime).split(" ")[4];

    return event;
  }

  function clearEventFromRecursiveFields(event: any): any {
    if (!event.isCyclic) {
      delete event.startRecur;
      delete event.endRecur;
      delete event.daysOfWeek;
      delete event.startTime;
      delete event.endTime;
    }

    return event;
  }

  async function handleAddEventSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let event = { ...newEvent, calendarId: chosenCalendarId };
    if (newEvent.allDay) {
      event.end = dayjs(newEvent.end).add(1, "day").toISOString();
    }

    if (newEvent.isCyclic && newEvent.allDay) {
      delete event.startTime;
      delete event.endTime;
    } else {
      if (newEvent.startTime !== undefined) {
        let startTime = dayjs(newEvent.startTime);
        let start = dayjs(event.start)
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(startTime.second());

        event.start = new Date(start.toISOString());
        event.startTime = startTime.toISOString().split("T")[1].split(".")[0];
      }

      if (newEvent.endTime !== undefined) {
        let endTime = dayjs(newEvent.endTime);
        let end = dayjs(event.end)
          .hour(endTime.hour())
          .minute(endTime.minute())
          .second(endTime.second());

        event.end = new Date(end.toISOString());
        event.endTime = endTime.toISOString().split("T")[1].split(".")[0];
      }
    }
    if (!newEvent.isCyclic) {
      delete event.startRecur;
      delete event.endRecur;
    }
    console.log("Event to be saved", event);

    const responseEvent = await axios.post(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    const clearedEvent = clearEventFromRecursiveFields(responseEvent.data);
    console.log(clearedEvent);

    setAllEvents([...allEvents, clearedEvent]);
    setFilteredEvents([...filteredEvents, clearedEvent]);
    setAddEventModal(false);
    setNewEvent({});
  }

  async function handleEditEventSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let event = newEvent;
    console.log("NEW EDITTED EVENT", event);

    const newAllEvents = allEvents.filter(
      (event) => Number(event.id) !== Number(eventIdToEdit)
    );
    const newFilteredEvents = filteredEvents.filter(
      (event) => Number(event.id) !== Number(eventIdToEdit)
    );

    if (newEvent.isCyclic && newEvent.allDay) {
      delete event.startTime;
      delete event.endTime;
    } else {
      if (newEvent.startTime !== undefined) {
        let startTime = dayjs(newEvent.startTime);
        let start = dayjs(event.start)
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(startTime.second());

        event.start = new Date(start.toISOString());
        event.startTime = startTime.toISOString().split("T")[1].split(".")[0];
      }

      if (newEvent.endTime !== undefined) {
        let endTime = dayjs(newEvent.endTime);
        let end = dayjs(event.end)
          .hour(endTime.hour())
          .minute(endTime.minute())
          .second(endTime.second());

        event.end = new Date(end.toISOString());
        event.endTime = endTime.toISOString().split("T")[1].split(".")[0];
      }
    }
    if (!newEvent.isCyclic) {
      delete event.startRecur;
      delete event.endRecur;
    }

    const responseEvent = await axios.put(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    const clearedEvent = clearEventFromRecursiveFields(responseEvent.data);

    setNewEvent(clearedEvent);
    setViewEventModal(true);
    setAllEvents([...newAllEvents, clearedEvent]);
    setFilteredEvents([...newFilteredEvents, clearedEvent]);
    setEditEventModal(false);
    setEventIdToEdit(clearedEvent.id);
  }

  function handleCalendarChangeSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (showEditCalendarModal) {
      handleEditCalendarSubmit(e);
    } else {
      handleAddCalendarSubmit(e);
    }
  }

  async function handleAddCalendarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const responseCalendar = await axios.post(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/calendars`,
      newCalendar,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    if (chosenCalendarId === null) {
      setChosenCalendarId(responseCalendar.data.id);
    }
    setAllCalendars([...allCalendars, responseCalendar.data]);
    setAddCalendarModal(false);
    setNewCalendar({});
  }

  async function handleEditCalendarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newEdittedCalendar = newCalendar;
    const newAllCalendars = allCalendars.filter(
      (calendar) => Number(calendar.id) !== Number(calendarIdToEdit)
    );

    const responseCalendar = await axios.put(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/calendars`,
      newEdittedCalendar,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    let sortedAllCalendars = [...newAllCalendars, responseCalendar.data].sort(
      (a, b) => a.id - b.id
    );

    setAllCalendars(sortedAllCalendars);
    setEditCalendarModal(false);
    setCalendarIdToEdit(null);
    setNewCalendar({});
  }

  async function handleDeleteCalendar() {
    const filteredAllCalendars = allCalendars.filter(
      (calendar) => Number(calendar.id) !== Number(calendarIdToDelete)
    );
    setAllCalendars(filteredAllCalendars);
    if (chosenCalendarId === calendarIdToDelete) {
      const nextChosenCalendar = filteredAllCalendars[0]
        ? filteredAllCalendars[0].id
        : null;
      setChosenCalendarId(nextChosenCalendar);
    }

    await axios.delete(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/calendars/${Number(
        calendarIdToDelete
      )}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    setDeleteCalendarModal(false);
    setCalendarIdToDelete(null);
  }

  return (
    <>
      <Header setSettingsModal={setSettingsModal} />
      <SettingsModal
        userSettings={userSettings}
        showSettingsModal={showSettingsModal}
        setSettingsModal={setSettingsModal}
        handleCloseModal={handleCloseModal}
      />
      <DeleteEventModal
        showDeleteEventModal={showDeleteEventModal}
        setDeleteEventModal={setDeleteEventModal}
        handleDeleteEvent={handleDeleteEvent}
        handleCloseModal={handleCloseModal}
      />
      <EventModal
        handleEndChange={handleEndChange}
        handleStartChange={handleStartChange}
        showAddEventModal={showAddEventModal}
        showEditEventModal={showEditEventModal}
        handleCloseModal={handleCloseModal}
        eventModalTitle={eventModalTitle}
        handleEventChangeSubmit={handleEventChangeSubmit}
        newEvent={newEvent}
        handleDaysChange={handleDaysChange}
        handleTitleChange={handleTitleChange}
        handleIsCyclicChange={handleIsCyclicChange}
        handleAllDayChange={handleAllDayChange}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
        handleStartRecurennceChange={handleStartRecurennceChange}
        handleEndRecurennceChange={handleEndRecurennceChange}
        pickedDatesInvalid={pickedDatesInvalid}
        pickedRecurDatesInvalid={pickedRecurDatesInvalid}
        pickedTimeInvalid={pickedTimeInvalid}
        handleUrlStrChange={handleUrlStrChange}
        handleDescriptionChange={handleDescriptionChange}
        showDeleteButton={showDeleteButton}
        setDeleteEventModal={setDeleteEventModal}
      />
      <ViewEventModal
        handleCloseModal={handleCloseModal}
        showViewEventModal={showViewEventModal}
        newEvent={newEvent}
        moveFromViewingToEditing={moveFromViewingToEditing}
      />
      <CalendarModal
        showAddCalendarModal={showAddCalendarModal}
        showEditCalendarModal={showEditCalendarModal}
        handleCloseModal={handleCloseModal}
        calendarModalTitle={calendarModalTitle}
        handleCalendarChangeSubmit={handleCalendarChangeSubmit}
        newCalendar={newCalendar}
        handleCalendarChange={handleCalendarChange}
      />
      <DeleteCalendarModal
        showDeleteCalendarModal={showDeleteCalendarModal}
        setDeleteCalendarModal={setDeleteCalendarModal}
        handleDeleteCalendar={handleDeleteCalendar}
        handleCloseModal={handleCloseModal}
      />
      <main className="flex h-max text-black flex-col items-center justify-between px-10 pt-5">
        <div className="grid grid-cols-12">
          <div className="col-span-10">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              events={filteredEvents}
              eventContent={renderEventContent}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              dateClick={handleDateClick}
              eventClick={(data) => handleClickEventModal(data)}
            />
          </div>
          <div className="ml-2 w-[200px] border-2 justify-center rounded-md mt-1 lg:h-[69%] bg-white">
            <div className="grid grid-cols-3 min-h-[48px] mb-3  w-full font-bold text-lg text-center bg-green-900 text-white rounded-md">
              <div className="col-start-1 col-end-3">
                <span className="inline-block align-middle my-2 pl-3">
                  My Calendars
                </span>
              </div>
              <div className="align-middle flex justify-center m-1.5 items-stretch col-start-3 justify-content">
                <IconButton
                  onClick={handleAddCalendarModal}
                  className="hover:bg-gray-900 h-8 w-8 text-white bg-gray-800 col-start-3 rounded-full"
                >
                  <AddIcon />
                </IconButton>
              </div>
            </div>

            {allCalendars.map((calendar) => (
              <div
                key={calendar.id}
                className="px-2 mt-2 flex justify-center gap-1"
              >
                <CalendarButton
                  key={calendar.id}
                  onClick={() => setChosenCalendarId(calendar.id)}
                  className={`py-1 px-3 m-1 w-full text-white ${
                    chosenCalendarId === calendar.id
                      ? "bg-green-950"
                      : "bg-green-800"
                  }`}
                >
                  {calendar.name}
                </CalendarButton>
                <IconButton
                  aria-label="edit calendar"
                  onClick={() => handleEditCalendarModal(calendar)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="delete calendar"
                  onClick={() => handleDeleteCalendarModal(calendar)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={isSnackbarOpened}
          onClose={closeSnackbar}
          TransitionComponent={Slide}
          message="You can't add event without calendar"
          key={Slide.name}
          autoHideDuration={3000}
        />
      </main>
    </>
  );
}
