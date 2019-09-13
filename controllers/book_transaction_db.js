const express = require("express"),
  router = express.Router();
const transaction = require("../models/book_transaction_db");

router
  .route("/issue")
  .get(transaction.getAllBookIssues)
  .post(transaction.createBookIssue);

router
  .route("/issue/:id")
  .get(transaction.getBookIssueByIssueId)
  .put(transaction.updateBookIssue)
  .delete(transaction.deleteBookIssue);

router
  .route("/issue/call/:call_number")
  .get(transaction.getBookIssueByCallNumber);

router.route("/issue/book/:book_id").get(transaction.getBookIssuesByBookId);

router
  .route("/issue/member/:member_id")
  .get(transaction.getBookIssuesByMemberId)
  .delete(transaction.deleteBookIssueByMemberId);

router
  .route("/issue/returned/:returned")
  .get(transaction.getBookIssuesByReturned);

router
  .route("/return")
  .get(transaction.getAllBookReturns)
  .post(transaction.createBookReturn)
  .put(transaction.updateBookReturn);

router
  .route("/return/:id")
  .get(transaction.getBookReturnByReturnId)
  .put(transaction.deleteBookReturn)
  .delete(transaction.deleteBookIssue);

router
  .route("/return/call/:call_number")
  .get(transaction.getBookReturnByCallNumber);

router.route("/return/book/:book_id").get(transaction.getBookReturnsByBookId);

router
  .route("/return/member/:member_id")
  .get(transaction.getBookReturnsByMemberId);

module.exports = router;
