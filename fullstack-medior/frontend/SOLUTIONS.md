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

## TASK 6 - State Management Discussion

### The Approach

For this use case, I would use a combination of **React Context** and **local component state**.

The reason is that not all state needs to be global. Some values are needed across the application, while some values are only needed in one page or one component. So, I would keep shared application-level state in React Context and keep page-specific state locally.

### State Breakdown

| State                      | Approach              | Reason                                                                                                                                                                                              |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logged-in user information | React Context         | This data may be needed in many places, such as the navigation bar, protected routes, and API calls. Since it is shared across the app and does not change very often, React Context is a good fit. |
| Feature flags              | React Context         | Feature flags are usually loaded once and then used in different parts of the app to show or hide features. Since this is shared and mostly read-only, Context would work well here.                |
| Current clinic selection   | React Context         | The selected clinic may affect multiple pages and API requests. For example, patient lists and appointment lists may depend on the selected clinic. So this should be available globally.           |
| Appointment filters        | Local component state | Appointment filters are most likely only needed on the appointments page. Since other parts of the app do not need this state, keeping it local avoids unnecessary global state.                    |

### Why Not Redux?

I would not choose Redux for this use case at this stage.

Redux is useful for larger applications with more complex state flows, but for this setup it may be too much. It adds extra boilerplate such as actions, reducers, store setup, and more structure around state updates.

For a small or medium-sized app with only a few global values, React Context should be enough. Using Redux here could make the code more complicated than needed.

### Why Not Zustand?

Zustand is a good option and is simpler than Redux. It has less boilerplate and can be useful when state becomes more complex or when performance becomes a concern.

However, for the current requirements, I would not add an extra dependency immediately. React Context and local state should be enough for now.

If the app grows and we start seeing too many re-renders, or if more unrelated components need to share frequently changing state, then Zustand would be a good option to consider.

### React Context Trade-off

One thing to keep in mind is that React Context can cause unnecessary re-renders if too much state is placed in one large context.

To avoid this, I would not create one big `AppContext` for everything. Instead, I would split the state into smaller contexts, such as:

* `UserContext`
* `FeatureFlagContext`
* `ClinicContext`

This way, if the current clinic changes, only the components that depend on the clinic context need to re-render.

### Final Decision

So, my final approach would be:

* Use React Context for logged-in user information.
* Use React Context for feature flags.
* Use React Context for the current clinic selection.
* Use local component state for appointment filters.

This keeps the implementation simple, avoids unnecessary dependencies, and still allows the application to grow in a clean way. If the frontend becomes more complex later, I would consider moving to Zustand before Redux because it is simpler and has less boilerplate.

