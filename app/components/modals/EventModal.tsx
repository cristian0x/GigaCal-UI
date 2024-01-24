import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FormControlLabel from "@mui/material/FormControlLabel";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { Alert, Stack } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ToggleDays from "../ToggleDays";
import { GreenSwitch } from "../GreenSwitch";
import { useEffect, useState } from "react";

function EventModal(props: any) {
  const [savedEvent, setSavedEvent] = useState<any>({});

  useEffect(() => {
    if (props.newEvent?.start !== undefined) {
      setSavedEvent(props.newEvent);
    }
  }, [props.newEvent]);

  return (
    <Transition.Root
      show={props.showAddEventModal || props.showEditEventModal}
      as={Fragment}
    >
      <Dialog
        as="div"
        className="disable-scroll relative z-10 overflow-auto"
        onClose={() => props.handleCloseModal()}
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
              <Dialog.Panel
                className="relative transform overflow-hidden rounded-lg 
              bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
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
                      {props.eventModalTitle ? props.eventModalTitle : ""}
                    </Dialog.Title>
                    <form
                      action="submit"
                      onSubmit={props.handleEventChangeSubmit}
                    >
                      <div className="mt-2">
                        <TextField
                          fullWidth
                          required
                          id="outlined-required"
                          label="Title"
                          value={savedEvent.title ? savedEvent.title : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.handleTitleChange(e)
                          }
                          error={props.newEvent.title === ""}
                          helperText={
                            props.newEvent.title === ""
                              ? "Empty event title"
                              : ""
                          }
                          size="small"
                        />
                      </div>
                      <div className="mt-2 text-black flex justify-center gap-1">
                        <FormControlLabel
                          control={
                            <GreenSwitch
                              checked={savedEvent.isCyclic}
                              onChange={props.handleIsCyclicChange}
                              name="isCyclic"
                            />
                          }
                          label="Is cyclic?"
                        />
                        <FormControlLabel
                          control={
                            <GreenSwitch
                              checked={
                                savedEvent.allDay ? savedEvent.allDay : false
                              }
                              onChange={props.handleAllDayChange}
                              name="allDay"
                            />
                          }
                          label="All day?"
                        />
                      </div>
                      {savedEvent.isCyclic ? (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          {!savedEvent.allDay && (
                            <div className="flex justify-center gap-1 mt-2">
                              <TimePicker
                                label="Start time"
                                value={dayjs(savedEvent.start)}
                                onChange={(newValue) =>
                                  props.handleStartTimeChange(newValue)
                                }
                              />
                              <TimePicker
                                label="End time"
                                value={dayjs(savedEvent.end)}
                                onChange={(newValue) =>
                                  props.handleEndTimeChange(newValue)
                                }
                              />
                            </div>
                          )}
                          <div className="flex justify-center gap-1 mt-2">
                            <DatePicker
                              label="Start recurenncy"
                              value={dayjs(savedEvent.startRecur)}
                              onChange={(newValue) =>
                                props.handleStartRecurennceChange(newValue)
                              }
                            />
                            <DatePicker
                              label="End recurenncy"
                              value={dayjs(savedEvent.endRecur)}
                              onChange={(newValue) =>
                                props.handleEndRecurennceChange(newValue)
                              }
                            />
                          </div>
                        </LocalizationProvider>
                      ) : (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          {!savedEvent.allDay && (
                            <div className="flex justify-center gap-1 mt-2">
                              <TimePicker
                                label="Start time"
                                value={dayjs(savedEvent.start)}
                                onChange={(newValue) =>
                                  props.handleStartTimeChange(newValue)
                                }
                              />
                              <TimePicker
                                label="End time"
                                value={dayjs(savedEvent.end)}
                                onChange={(newValue) =>
                                  props.handleEndTimeChange(newValue)
                                }
                              />
                            </div>
                          )}
                          <div className="flex justify-center gap-1 mt-2">
                            <DatePicker
                              label="Start date"
                              value={dayjs(savedEvent.start)}
                              onChange={(newValue) =>
                                props.handleStartChange(newValue)
                              }
                            />
                            <DatePicker
                              label="End date"
                              value={dayjs(savedEvent.end)}
                              onChange={(newValue) =>
                                props.handleEndChange(newValue)
                              }
                            />
                          </div>
                        </LocalizationProvider>
                      )}
                      {savedEvent.isCyclic && (
                        <ToggleDays
                          daysOfWeek={
                            savedEvent.daysOfWeek ? savedEvent.daysOfWeek : []
                          }
                          handleDaysChange={props.handleDaysChange}
                        />
                      )}
                      <Stack
                        className="my-2"
                        spacing={2}
                        sx={{ width: "100%" }}
                        style={{
                          visibility:
                            props.pickedDatesInvalid ||
                            props.pickedRecurDatesInvalid ||
                            props.pickedTimeInvalid
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        <Alert severity="error">
                          <span className="font-bold">Invalid date</span>
                        </Alert>
                      </Stack>
                      <div className="mt-2">
                        <TextField
                          fullWidth
                          id="outlined-required"
                          label="Url"
                          value={savedEvent.urlStr ? savedEvent.urlStr : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.handleUrlStrChange(e)
                          }
                          size="small"
                        />
                      </div>
                      <div className="mt-2">
                        <TextField
                          fullWidth
                          id="outlined-required"
                          label="Description"
                          value={
                            savedEvent.description ? savedEvent.description : ""
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.handleDescriptionChange(e)
                          }
                          size="small"
                        />
                      </div>
                      {props.showDeleteButton ? (
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm 
                                    font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline 
                                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 
                                    sm:col-start-3 disabled:opacity-25"
                            disabled={
                              props.title === "" ||
                              props.newEvent.title === undefined ||
                              props.pickedDatesInvalid
                            }
                          >
                            {props.eventModalTitle?.split(" ")[0]}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm 
                                    font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 
                                    hover:bg-gray-50 sm:col-start-2 sm:mt-0"
                            onClick={props.handleCloseModal}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                                    font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            onClick={() => props.setDeleteEventModal(true)}
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
                            onClick={props.handleCloseModal}
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
                              savedEvent.title === "" ||
                              savedEvent.title === undefined ||
                              props.pickedDatesInvalid
                            }
                          >
                            {props.eventModalTitle?.split(" ")[0]}
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
  );
}

export default EventModal;
