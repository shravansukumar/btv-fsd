/*
 * TASK 5 — Bug fix
 *
 * The component below has a bug. Identify it, explain why it happens, fix it,
 * and note any additional improvements you would make (see the assignment
 * questions). Left here verbatim from the assignment on purpose.
 *
 * This file is NOT imported anywhere — it exists only for the Task 5 writeup.
 


PLEASE REFER TO SOLUTIONS.md FILE FOR EXPLANATION ON THE FIX, I STARTED WRITING MY ANSWERS THERE, FOR BETTER READABILITY.

TL;DR: THE useEffect dependency array includes patients, which causes an infinite render loop.

*/
import { useState, useEffect } from "react";

export default function PatientList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    const response = await fetch("/api/patients");
    const data = await response.json();
    setPatients(data);
  }

  return (
    <div>
      {patients.map((patient) => (
        <div>{patient.name}</div>
      ))}
    </div>
  );
}
