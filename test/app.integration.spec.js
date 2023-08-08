const request = require("supertest");
const app = require("../app");
const connection = require("../connection");

describe("Test routes", () => {
  it('GET / sends "Hello World" as json', (done) => {
    request(app)
      .get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expected = { message: "Hello World!" };
        expect(response.body).toEqual(expected);
        done();
      });
  });

  it("POST /bookmarks - error (fields missing) ", (done) => {
    request(app)
      .post("/bookmarks")
      .send({})
      .expect(422)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expected = { error: "required field(s) missing" };
        expect(response.body).toEqual(expected);
        done();
      });
  });

  it("POST /bookmarks - OK (fields provided) ", (done) => {
    request(app)
      .post("/bookmarks")
      .send({ url: "https://jestjs.io", title: "Jest" })
      .expect(201)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expected = {
          id: expect.any(Number),
          url: "https://jestjs.io",
          title: "Jest",
        };
        expect(response.body).toEqual(expected);
        done();
      })
      .catch(done);
  });

  describe("get by id", () => {
    const testBookmark = { url: "https://nodejs.org/", title: "Node.js" };

    beforeEach((done) => {
      connection.query("TRUNCATE bookmark", () => {
        connection.query("INSERT INTO bookmark SET ?", testBookmark, done);
      });
    });

    it("should return 404 if bookmark not found", (done) => {
      request(app)
        .get("/bookmarks/999")
        .expect(404)
        .expect("Content-Type", /json/)
        .then((response) => {
          const expected = { error: "Bookmark not found" };
          expect(response.body).toEqual(expected);
          done();
        })
        .catch((error) => done(error));
    });

    it("should return the bookmark object with correct ID", (done) => {
      request(app)
        .get("/bookmarks/1")
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response) => {
          const expected = { id: 1, ...testBookmark };
          expect(response.body).toEqual(expected);
          done();
        })
        .catch((error) => done(error));
    });
  });
});
