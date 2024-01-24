import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { GreenSwitch } from "../GreenSwitch";
import { FormControl, FormControlLabel, makeStyles } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

function SettingsModal(props: any) {
  const [userSettings, setUserSettings] = useState<any>({});

  async function handleEditUserSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let newUserSettings = userSettings;
    if (!userSettings.areNotificationsEnabled) {
      newUserSettings.notificationChannelType = "NONE";
      newUserSettings.timeBeforeEvent = 0;
    }
    console.log(newUserSettings);

    const responseEvent = await axios.put(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/settings`,
      newUserSettings,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    const savedUserSettings = responseEvent.data;
    console.log(savedUserSettings);
    setUserSettings(savedUserSettings);
    props.handleCloseModal();
  }

  const handleChangeNotificationsEnabled = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    console.log(userSettings.areNotificationsEnabled);
    setUserSettings({
      ...userSettings,
      areNotificationsEnabled: !userSettings.areNotificationsEnabled,
    });
  };

  const handleTimeBeforeEventChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    let value = Number(e.target.value);
    if (value < 1) {
      value = 1;
    }
    if (value > 60) {
      value = 60;
    }
    setUserSettings({
      ...userSettings,
      timeBeforeEvent: value,
    });
  };

  const handleChannelChange = (e: any) => {
    setUserSettings({
      ...userSettings,
      notificationChannelType: e.target.value,
    });
  };

  useEffect(() => {
    if (props.userSettings?.areNotificationsEnabled !== undefined) {
      setUserSettings(props.userSettings);
    }
  }, [props.userSettings]);

  return (
    <Transition.Root show={props.showSettingsModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={props.handleCloseModal}
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
                   bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              >
                <div>
                  <div className="mt-3 text-center sm:mx-4 sm:mt-0 sm:text-left justify-content">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Settings
                    </Dialog.Title>
                    <form action="submit" onSubmit={handleEditUserSettings}>
                      <div className="my-2 content-center text-black">
                        <FormControlLabel
                          control={
                            <GreenSwitch
                              checked={
                                userSettings.areNotificationsEnabled
                                  ? userSettings.areNotificationsEnabled
                                  : false
                              }
                              onChange={handleChangeNotificationsEnabled}
                              name="areNotificationsEnabled"
                            />
                          }
                          label="Notifications enabled"
                        />
                      </div>
                      {userSettings.areNotificationsEnabled && (
                        <div>
                          <div className="my-5 sm:min-w-full">
                            <FormControl size="small" sx={{ minWidth: "100%" }}>
                              <InputLabel id="demo-simple-select-label">
                                Notification channel
                              </InputLabel>
                              <Select
                                className="text-black"
                                fullWidth
                                label="Notification channel"
                                id="outlined-required"
                                value={
                                  userSettings.notificationChannelType
                                    ? userSettings.notificationChannelType
                                    : "SMS"
                                }
                                onChange={handleChannelChange}
                              >
                                <MenuItem value={"SMS"}>SMS</MenuItem>
                                <MenuItem value={"EMAIL"}>Email</MenuItem>
                              </Select>
                            </FormControl>
                          </div>
                          <div className="my-5">
                            <TextField
                              fullWidth
                              required
                              type="number"
                              id="outlined-required"
                              label="Minutes before event"
                              value={
                                userSettings.timeBeforeEvent
                                  ? userSettings.timeBeforeEvent
                                  : 15
                              }
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) => handleTimeBeforeEventChange(e)}
                              error={
                                userSettings.timeBeforeEvent &&
                                userSettings.timeBeforeEvent <= 0
                              }
                              helperText={
                                userSettings?.timeBeforeEvent &&
                                userSettings.timeBeforeEvent <= 0
                                  ? "Invalid value"
                                  : ""
                              }
                              size="small"
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    onClick={(e: any) => handleEditUserSettings(e)}
                    className="inline-flex w-full justify-center rounded-md bg-green-700 px-3 py-2 text-sm font-semibold 
                    text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 
                    focus-visible:outline-offset-2 focus-visible:outline-green-700 sm:col-start-2 disabled:opacity-25"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={props.handleCloseModal}
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
  );
}

export default SettingsModal;
