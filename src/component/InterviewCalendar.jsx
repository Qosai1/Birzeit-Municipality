import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../style.css";

export default function InterviewCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/interviews");
      const data = await res.json();

      const formattedEvents = data.map(parseEvent);
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to fetch interview data:", err);
    }
  };

  const parseEvent = (interview) => {
    const date = new Date(interview.interviewDate); 
    const [hours, minutes, seconds] = interview.interviewTime.split(":").map(Number);

    date.setHours(hours, minutes, seconds || 0, 0);

    const endDate = new Date(date.getTime() + Number(interview.duration || 30) * 60000);

    return {
      id: interview.id,
      title: `Interview - ${interview.employeeName}`,
      start: date,
      end: endDate,
      extendedProps: {
        email: interview.email,
        department: interview.department,
        interviewer: interview.interviewer,
        location: interview.location,
        duration: interview.duration,
        notes: interview.notes,
      },
    };
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    });
  };

  const closeModal = () => setSelectedEvent(null);

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Interview Schedule</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventColor="#007bff"
        eventClick={handleEventClick}
        height="100%"
      />

      {selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedEvent.start).toLocaleString()} -{" "}
              {new Date(selectedEvent.end).toLocaleTimeString()}
            </p>
            <p>
              <strong>Department:</strong> {selectedEvent.department}
            </p>
            <p>
              <strong>Interviewer:</strong> {selectedEvent.interviewer}
            </p>
            <p>
              <strong>Location:</strong> {selectedEvent.location}
            </p>
            <p>
              <strong>Duration:</strong> {selectedEvent.duration} mins
            </p>
            <p>
              <strong>Email:</strong> {selectedEvent.email}
            </p>
            <p>
              <strong>Notes:</strong> {selectedEvent.notes || "None"}
            </p>

            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
