import PatientSearch from "./components/PatientSearch.jsx";

export default function App() {
  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Patients</h1>
      <PatientSearch />
    </main>
  );
}
