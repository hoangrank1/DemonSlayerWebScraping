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

app.get("/v1", (req, response) => {
  const thumbnails = [];
  const limit = Number(req.query.limit);

  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".portal", html).each(function() {
        const name = $(this).find("a").attr("title"); // this point to class portal
        const wiki = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("data-src");
        thumbnails.push({
          name: name,
          wiki: "http://localhost:3001/v1" + wiki.split("/wiki")[1],
          image: image,
        });
      });
      if (limit && limit > 0) {
        response.status(200).json(thumbnails.slice(0, limit));
      } else {
        response.status(200).json(thumbnails);
      }
    });
  } catch(err) {
    response.status(500).json(err);
  }
});

app.get("/v1/:character", (req, response) => {
  let currentUrl = characterUrl + req.params.character;
  const titles = [];

  try {
    axios(currentUrl).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      //class name will put "." before the name like: .portal
      // Get the title of chracter detail
      $("aside", html).each(function() {
        $(this).find("section > div > h3").each(function() {
          titles.push($(this).text());
        })
      });
      console.log(titles);
    });
  } catch(err) {
    response.status(500).json(err);
  }
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));