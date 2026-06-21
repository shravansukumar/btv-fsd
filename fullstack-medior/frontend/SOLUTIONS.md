## TASK 5 - Bug Fix

### The Issue

The issue here is that the `useEffect` dependency array includes `patients`:

```jsx
useEffect(() => {
  fetchPatients();
}, [patients]);
```

This can create an infinite render loop.

### The Why

This happens because the effect runs when the component first mounts and calls `fetchPatients()`. Inside `fetchPatients()`, the patient data is fetched from the API and then `setPatients(data)` is called.

Once `setPatients(data)` runs, the `patients` state changes. Since `patients` is present in the dependency array, React runs the `useEffect` again. This again calls `fetchPatients()`, which again updates `patients`, and the same cycle keeps repeating.

So, the problem is that the API call is linked to the same state that it updates. This can cause repeated API calls and continuous re-renders.

### The Fix

Since the requirement here is to fetch the patient list when the component is loaded, the dependency array should be empty:

```jsx
useEffect(() => {
  fetchPatients();
}, []);
```

This means the effect will run only once when the component mounts, instead of running every time `patients` changes.

### Additional Improvements

There are also a few other improvements I would make.

First, each rendered patient should have a `key` prop:

```jsx
{patients.map((patient) => (
  <div key={patient.id}>
    {patient.name}
  </div>
))}
```

Second, I would add basic error handling around the API call, so the component can handle failed requests properly.

Third, I would consider adding a loading state, so the UI can show that the patient list is being fetched instead of showing an empty list.


