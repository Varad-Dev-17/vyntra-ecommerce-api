try {
  const d = new Date(undefined);
  console.log(d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute:"2-digit" }));
} catch(e) {
  console.error(e);
}
