import config from "./Config/envCongig";
import app from "./app";

const port = config.port || 4000;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
