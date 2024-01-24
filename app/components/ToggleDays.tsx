import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import { styled, alpha } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const DAYS = [
  {
    key: "0",
    label: "S",
  },
  {
    key: "1",
    label: "M",
  },
  {
    key: "2",
    label: "T",
  },
  {
    key: "3",
    label: "W",
  },
  {
    key: "4",
    label: "T",
  },
  {
    key: "5",
    label: "F",
  },
  {
    key: "6",
    label: "S",
  },
];

const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    margin: theme.spacing(2),
    padding: theme.spacing(0, 1),
    "&:not(:first-child)": {
      border: "1px solid",
      borderColor: "#000000",
      borderRadius: "50%",
    },
    "&:first-child": {
      border: "1px solid",
      borderColor: "#000000",
      borderRadius: "50%",
    },
  },
}))(ToggleButtonGroup);

export const StyledToggle = withStyles({
  root: {
    color: "#000000",
    "&$selected": {
      color: "white",
      background: green[700],
    },
    "&:hover": {
      borderColor: green[800],
      background: green[800],
    },
    "&:hover$selected": {
      borderColor: green[900],
      background: green[900],
    },
    minWidth: 32,
    maxWidth: 32,
    height: 32,
    textTransform: "unset",
    fontSize: "0.75rem",
  },
  selected: {},
})(ToggleButton);

const ToggleDays = (props: any) => {
  const [days, setDays] = useState<any>(
    props.daysOfWeek.map((day: any) => Number(day))
  );

  return (
    <>
      <StyledToggleButtonGroup
        size="small"
        arial-label="Days of the week"
        value={days}
        onChange={(event, value) => {
          setDays(value);
          props.handleDaysChange(value);
        }}
        className="flex"
      >
        <p className="text-black content-center pt-4 mr-3">Days of the week</p>
        {DAYS.map((day, index) => (
          <StyledToggle
            className="weekDay"
            key={day.key}
            value={index}
            aria-label={day.key}
          >
            {day.label}
          </StyledToggle>
        ))}
      </StyledToggleButtonGroup>
    </>
  );
};

export default ToggleDays;
