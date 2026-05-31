import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  assets,
  type DateTimeType,
  type dummyShowsDataType,
} from "../assets/assets";
import Loading from "../components/Loading";
import { ClockIcon } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  console.log("Date got from params is : ", date);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); //by default there will be no selected seats and empty arrays will be there
  const [selectedTime, setSelectedTime] = useState<DateTimeType | null>(null);
  const [show, setShow] = useState<{
    movie?: dummyShowsDataType;
    dateTime?: Record<string, DateTimeType[]>;
  }>({});

  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);

  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (!selectedTime) {
      return toast("Please select time first");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can only select 5 seats");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast("This seat is already booked");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId],
    );
  };

  const renderSeats = (row: string, count: number = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <p className="w-8 flex items-center justify-center text-xs font-semibold">
        {row}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition
                ${
                  selectedSeats.includes(seatId)
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
                }
                ${occupiedSeats.includes(seatId) ? " opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime?.showId}`,
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) {
        //user not logged in
        return toast.error("Please login to proceed");
      }

      if (!selectedTime || !selectedSeats.length)
        return toast.error("Please select a time and seats");
      const token = await getToken();
      const { data } = await axios.post(
        "/api/booking/create",
        { showId: selectedTime.showId, selectedSeats },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getShow(); //it will find the show and add it in the show state
  }, []);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  console.log("show date time  : ", show.dateTime);

  return show.movie && date ? (
    <div className="flex flex-col px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Timings and Seats Container */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Available timings */}
        <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
          <p className="text-lg font-semibold px-6">Available Timings</p>
          <div>
            {show.dateTime &&
              show.dateTime[date] &&
              show.dateTime[date].map((item: DateTimeType) => {
                const timeString = new Date(item.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isSelected =
                  selectedTime && selectedTime.time === item.time;
                return (
                  <div
                    key={item.showId}
                    onClick={() => setSelectedTime(item)}
                    className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${isSelected ? "bg-primary text-black" : "hover:bg-primary/20"}`}
                  >
                    <ClockIcon className="w-4 h-4" />
                    <p className="text-sm">{timeString}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Seats Layout */}
        <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle top="100px" left="100px" />
          <h1 className="text-2xl  font-semibold mb-4"> Select Your Seat </h1>
          <img src={assets.screenImage} alt="Screen" />
          <p className="text-gray-400 text-sm  mb-6">Screen Side</p>
          <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11 mt-2">
            {groupRows.slice(1).map((group, id) => {
              return <div key={id}>{group.map((row) => renderSeats(row))}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => bookTickets()}
          className="flex items-center gap-1 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
