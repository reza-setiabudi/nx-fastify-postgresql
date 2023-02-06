import fastify from 'fastify';
import { resolve } from 'path';
import pg from 'pg'

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = fastify();

app.get('/', async (req, res) => {
  return { message: 'Hello API news-api' };
});

const client = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'news_db',
  password: 'toor',
  port: 5432,
})
client.connect()

const addArticle = (req, res) => {
  const { title, body } = req.body;
  client.query("INSERT INTO article (title, body) VALUES ($1, $2)",
  [title, body],
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
};

const getArticle = (req, res) => {
  client.query("SELECT * from article",
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  })
}

const addTopic = (req, res) => {
  const { name } = req.body;
  client.query("INSERT INTO topic (name) VALUES ($1);",
  [name],
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
};

const getTopic = (req, res) => {
  client.query("SELECT * FROM topic;",
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
}

const addStatus = (req, res) => {
  const { name } = req.body;
  client.query("INSERT INTO status (name) VALUES ($1)",
  [name],
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
};

const getStatus = (req, res) => {
  client.query("SELECT * FROM status",
  (error, result) => {
    if (error){
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
};

const addNews = (req, res) => {
  const { title, body, topic_ids, status_id } = req.body;
  client.query("INSERT INTO article (title, body, status_id) VALUES ($1, $2, $3)",
  [title, body, status_id],
  (error, result) => {
    if (error){
      throw error;
    } else {
      client.query("SELECT id from article where title=($1)",
      [title],
      (error, article_result) => {
        if (error){
          throw error;
        } else {
          for (const topic in topic_ids) {
            client.query("INSERT INTO news (article_id, topic_id) VALUES ($1, $2)",
            [article_result.rows[0]['id'], topic],
            (error, result) => {
              if (error){
                throw error;
              } else {
                res.status(200).send(result.rows);
              }
            })
          }
        }
      })
    }
  })
}

const getNews = (req, res) => {
  client.query("SELECT * FROM news", (error, result) => {
    if (error) {
      throw error;
    } else {
      res.status(200).send(result.rows);
    }
  });
};

app.get('/news', getNews);
app.post('/news', addNews);

app.get('/article', getArticle);
app.post('/article', addArticle);

app.get('/topic', getTopic);
app.post('/topic', addTopic);

app.get('/status', getStatus);
app.post('/status', addStatus);

const start = async () => {
  try {
    await app.listen({ port });
    console.log(`[ ready ] http://localhost:${port}`);
  } catch (err) {
    // Errors are logged here
    process.exit(1);
  }
};

start();