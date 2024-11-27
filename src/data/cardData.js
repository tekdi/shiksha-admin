let state;

if (typeof window !== "undefined") {
  state = localStorage.getItem("stateName");
}
const cardData = [
  {
    id: "1",
    state: state,
  },
];

export default cardData;
