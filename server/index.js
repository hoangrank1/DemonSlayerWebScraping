import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";
import * as cheerio from 'cheerio';

const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki";
const characterUrl = "https://kimetsu-no-yaiba.fandom.com/wiki/";

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({
  policy: "cross-origin"
}));
app.use(morgan("common"));
app.use(bodyParser.json({
  limit: "50mb",
  extended: true
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000,
}));
app.use(cors());

app.get("/v1", (req, res) => {
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".portal", html).each(function() {
        const name = $(this).find("a").attr("title"); // this point to class portal
        console.log(name);
      });
    });
  } catch(err) {
    res.status(500).json(err);
  }
})

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));