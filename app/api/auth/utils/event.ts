// export interface Event {
//   title: string;
//   start: Date | string;
//   allDay: boolean;
//   id: number;
// }

export interface Event {
  id: number;
  calendarId: number;
  name: string;
  description: string;
  isCyclic: boolean;
  startDate: Date;
  endDate: Date;
  time: string;
  duration: number;
}
