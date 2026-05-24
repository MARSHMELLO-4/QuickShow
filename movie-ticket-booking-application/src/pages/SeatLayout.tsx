import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  assets,
  dummyDateTimeData,
  dummyShowsData,
  type DateTimeType,
  type dummyShowsDataType,
} from "../assets/assets";
import Loading from "../components/Loading";
import { ClockIcon } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
const SeatLayout = () => {
  const { id, date } = useParams();
  console.log("Date got from params is : ", date);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); //by default there will be no selected seats and empty arrays will be there
  const [selectedTime, setSelectedTime] = useState<DateTimeType | null>(null);
  const [show, setShow] = useState<{
    movie?: dummyShowsDataType;
    dateTime?: Record<string, DateTimeType[]>;
  }>({});

  const navigate = useNavigate();

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id); //from here we will get the individual show
    console.log("Show selected is : ", show);
    console.log("Date time is : ", dummyDateTimeData);
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
  };


  const handleSeatClick = (seatId : string) => {
    if(!selectedTime){
      return toast("Please select time first")
    }
    if(!selectedSeats.includes(seatId) &&selectedSeats.length > 4){
      return toast("You can only select 5 seats")
    }
    setSelectedSeats(prev => prev.includes(seatId));
  }

  const renderSeats = (row: number, count: number = 9) => (
  <div key={row} className="flex gap-2 mt-2">
    <div className="flex flex-wrap items-center justify-center gap-2">
    {
      Array.from({length: count}, (_,i) => {
        const seatId = `${row}${i+1}`;
        return (
          <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-primary text-white"}`}>
          </button>
        )
      })
    }
    </div>
  </div>
  );

  useEffect(() => {
    getShow(); //it will find the show and add it in the show state
  }, []);

  console.log("show date time  : ", show.dateTime);

  return show.movie && date ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
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
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
