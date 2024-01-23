"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import Header from "../components/Header";
import { Calendar } from "../api/auth/utils/calendar";
import "./page.css";
import Button from "@mui/material-next/Button";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { green } from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled, alpha } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import Slide from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ToggleDays from "../components/ToggleDays";
import { Alert, Stack } from "@mui/material";

export default function Home() {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState<any>({});

  const [showAddEventModal, setAddEventModal] = useState(false);
  const [showDeleteEventModal, setDeleteEventModal] = useState(false);
  const [showEditEventModal, setEditEventModal] = useState(false);
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

  const CalendarButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  }));

  const GreenSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: green[600],
      "&:hover": {
        backgroundColor: alpha(green[600], theme.palette.action.hoverOpacity),
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: green[600],
    },
  }));

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
  }, [newEvent]);

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

    const startTime = startDate.toISOString().split("T")[1].split(".")[0];
    const endTime = endDate.toISOString().split("T")[1].split(".")[0];

    setNewEvent({
      ...newEvent,
      start: startDate,
      end: endDate,
      startRecur: startDate,
      endRecur: endRecur,
      startTime: startTime,
      endTime: endTime,
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
    setShowDeleteButton(true);
    setEditEventModal(true);
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

    setAddCalendarModal(false);
    setEditCalendarModal(false);
    setDeleteCalendarModal(false);

    setNewEvent({});
    setNewCalendar({});
    setEventModalTitle(null);
  }

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      title: e.target.value,
    });
  };

  const handleStartTimeChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      start: data.$d.toISOString(),
      startTime: data.$d.toISOString().split("T")[1].split(".")[0],
    });
  };

  const handleEndTimeChange = (data: any): void => {
    setNewEvent({
      ...newEvent,
      end: data.$d.toISOString(),
      endTime: data.$d.toISOString().split("T")[1].split(".")[0],
    });
  };

  const handleStartRecurennceChange = (data: any): void => {
    console.log(data);
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
    console.log(days);
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
    const newTitle = eventInfo.event.title.slice(0, 12) + "...";
    return <p>{newTitle}</p>;
  }

  function handleEventChangeSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (showEditEventModal) {
      handleEditEventSubmit(e);
    } else {
      handleAddEventSubmit(e);
    }
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
    const newEdittedEvent = newEvent;
    console.log("NEW EDITTED EVENT", newEdittedEvent);
    const newAllEvents = allEvents.filter(
      (event) => Number(event.id) !== Number(eventIdToEdit)
    );
    const newFilteredEvents = filteredEvents.filter(
      (event) => Number(event.id) !== Number(eventIdToEdit)
    );

    const responseEvent = await axios.put(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/events`,
      newEdittedEvent,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    setAllEvents([...newAllEvents, responseEvent.data]);
    setFilteredEvents([...newFilteredEvents, responseEvent.data]);
    setEditEventModal(false);
    setEventIdToEdit(null);
    setNewEvent({});
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
      <Header />
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
          <div className="ml-2 w-max border-2 p-2 rounded-md mt-5 lg:h-1/2 bg-white">
            <h1 className="mb-2 font-bold text-lg text-center">
              Change Calendar
            </h1>
            {allCalendars.map((calendar) => (
              <div key={calendar.id} className="flex justify-center gap-1">
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
            <Button
              onClick={handleAddCalendarModal}
              variant="contained"
              className="p-1 m-1 mt-10 text-white w-full bg-green-800"
            >
              Add calendar
            </Button>
          </div>
        </div>

        <Transition.Root show={showDeleteEventModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setDeleteEventModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this event?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDeleteEvent}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root
          show={showAddEventModal || showEditEventModal}
          as={Fragment}
        >
          <Dialog
            as="div"
            className="disable-scroll relative z-10 overflow-auto"
            onClose={() => handleCloseModal()}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          {eventModalTitle}
                        </Dialog.Title>
                        <form
                          action="submit"
                          onSubmit={handleEventChangeSubmit}
                        >
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                            focus:ring-2 
                            focus:ring-inset focus:ring-violet-600 
                            sm:text-sm sm:leading-6"
                              value={newEvent.title ? newEvent.title : ""}
                              onChange={(e) => handleEventChange(e)}
                              placeholder="Title"
                            />
                          </div>
                          <div className="mt-2 text-black flex justify-center gap-1">
                            <FormControlLabel
                              control={
                                <GreenSwitch
                                  checked={newEvent.isCyclic}
                                  onChange={handleIsCyclicChange}
                                  name="isCyclic"
                                />
                              }
                              label="Is cyclic?"
                            />
                            <FormControlLabel
                              control={
                                <GreenSwitch
                                  checked={newEvent.allDay}
                                  onChange={handleAllDayChange}
                                  name="allDay"
                                />
                              }
                              label="All day?"
                            />
                          </div>
                          {!newEvent.isCyclic ? (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              {!newEvent.allDay ? (
                                <div className="flex justify-center gap-1 mt-2">
                                  <DateTimePicker
                                    label="Start"
                                    value={dayjs(newEvent.start)}
                                    onChange={(newValue) =>
                                      handleStartTimeChange(newValue)
                                    }
                                  />
                                  <DateTimePicker
                                    label="End"
                                    value={dayjs(newEvent.end)}
                                    onChange={(newValue) =>
                                      handleEndTimeChange(newValue)
                                    }
                                  />
                                </div>
                              ) : (
                                <div className="flex justify-center gap-1 mt-2">
                                  <DatePicker
                                    label="Start"
                                    value={dayjs(newEvent.startRecur)}
                                    onChange={(newValue) =>
                                      handleStartTimeChange(newValue)
                                    }
                                  />
                                  <DatePicker
                                    label="End"
                                    value={dayjs(newEvent.endRecur)}
                                    onChange={(newValue) =>
                                      handleEndTimeChange(newValue)
                                    }
                                  />
                                </div>
                              )}
                            </LocalizationProvider>
                          ) : (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <div className="flex justify-center gap-1 mt-2">
                                <TimePicker
                                  label="Start time"
                                  value={dayjs(newEvent.start)}
                                  onChange={(newValue) =>
                                    handleStartTimeChange(newValue)
                                  }
                                />
                                <TimePicker
                                  label="End time"
                                  value={dayjs(newEvent.end)}
                                  onChange={(newValue) =>
                                    handleEndTimeChange(newValue)
                                  }
                                />
                              </div>
                              <div className="flex justify-center gap-1 mt-2">
                                <DatePicker
                                  label="Start recurennce"
                                  value={dayjs(newEvent.startRecur)}
                                  onChange={(newValue) =>
                                    handleStartRecurennceChange(newValue)
                                  }
                                />
                                <DatePicker
                                  label="End recurennce"
                                  value={dayjs(newEvent.endRecur)}
                                  onChange={(newValue) =>
                                    handleEndRecurennceChange(newValue)
                                  }
                                />
                              </div>
                              <ToggleDays handleDaysChange={handleDaysChange} />
                            </LocalizationProvider>
                          )}
                          <Stack
                            className="my-2"
                            spacing={2}
                            sx={{ width: "100%" }}
                            style={{
                              visibility:
                                pickedDatesInvalid ||
                                pickedRecurDatesInvalid ||
                                pickedTimeInvalid
                                  ? "visible"
                                  : "hidden",
                            }}
                          >
                            <Alert severity="error">
                              <span className="font-bold">Invalid date</span>
                            </Alert>
                          </Stack>
                          {showDeleteButton ? (
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
                              <button
                                type="submit"
                                className="inline-flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm 
                                    font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline 
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 
                                    sm:col-start-3 disabled:opacity-25"
                                disabled={
                                  newEvent.title === "" ||
                                  newEvent.title === undefined ||
                                  pickedDatesInvalid
                                }
                              >
                                {eventModalTitle?.split(" ")[0]}
                              </button>
                              <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm 
                                    font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 
                                    hover:bg-gray-50 sm:col-start-2 sm:mt-0"
                                onClick={handleCloseModal}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                                    font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                onClick={() => setDeleteEventModal(true)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                              <button
                                type="button"
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm 
                                    font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 
                                    hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                onClick={handleCloseModal}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="inline-flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm 
                                    font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline 
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 
                                    sm:col-start-2 disabled:opacity-25"
                                disabled={
                                  newEvent.title === "" ||
                                  newEvent.title === undefined ||
                                  pickedDatesInvalid
                                }
                              >
                                {eventModalTitle?.split(" ")[0]}
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={showDeleteCalendarModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setDeleteCalendarModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this calendar?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDeleteCalendar}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root
          show={showAddCalendarModal || showEditCalendarModal}
          as={Fragment}
        >
          <Dialog as="div" className="relative z-10" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          {calendarModalTitle}
                        </Dialog.Title>
                        <form
                          action="submit"
                          onSubmit={handleCalendarChangeSubmit}
                        >
                          <div className="mt-2">
                            <input
                              type="text"
                              name="name"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                            focus:ring-2 
                            focus:ring-inset focus:ring-violet-600 
                            sm:text-sm sm:leading-6"
                              value={newCalendar.name ? newCalendar.name : ""}
                              onChange={(e) => handleCalendarChange(e)}
                              placeholder="Name"
                            />
                          </div>
                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 sm:col-start-2 disabled:opacity-25"
                              disabled={
                                newCalendar.name === "" ||
                                newCalendar?.name === undefined
                              }
                            >
                              {calendarModalTitle?.split(" ")[0]}
                            </button>
                            <button
                              type="button"
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                              onClick={handleCloseModal}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
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
