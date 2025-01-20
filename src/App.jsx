import { useEffect, useState } from "react";
import axios from "axios";
import socket from "./socket";

function App() {
  const [votes, setVotes] = useState([]);
  const [newVote, setNewVote] = useState(false);
  const [question, setQuestion] = useState("");

  // Fetch initial votes from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://votingapp-server-five.vercel.app/getVotes"
        );
        setVotes(response.data);
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };
    fetchData();
  }, []);

  // Handle real-time vote updates
  useEffect(() => {
    const handleAnswerOutput = ({ id, answer }) => {
      setVotes((prevVotes) =>
        prevVotes.map((vote) =>
          vote._id === id
            ? {
                ...vote,
                yes: answer === 1 ? vote.yes + 1 : vote.yes,
                no: answer === 0 ? vote.no + 1 : vote.no,
              }
            : vote
        )
      );
    };

    socket.on("answer:output", handleAnswerOutput);

    return () => {
      socket.off("answer:output", handleAnswerOutput);
    };
  }, []);

  // Emit answer input to the server
  const handleAnswerInput = (id, answer) => {
    socket.emit("answer:input", { id, answer });
  };

  // Add a new vote
  const handleAddVote = async () => {
    if (!question.trim()) {
      alert("Question cannot be empty");
      return;
    }
    try {
      await axios.post("https://votingapp-server-five.vercel.app/new-vote", {
        question,
      });
      setNewVote(false);
      setQuestion("");
    } catch (error) {
      console.error("Error adding vote:", error);
    }
  };

  // Handle delete vote
  const handleDeleteVote = async (id) => {
    try {
      await axios.delete(
        `https://votingapp-server-five.vercel.app/delete-vote/${id}`
      );
      setVotes((prevVotes) => prevVotes.filter((vote) => vote._id !== id)); // Remove the deleted vote from state
    } catch (error) {
      console.error("Error deleting vote:", error);
    }
  };

  return (
    <div className="flex flex-col px-6 mt-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vote Polling</h1>
        <button
          className="bg-blue-500 px-4 py-2 text-white rounded-lg"
          onClick={() => setNewVote((prev) => !prev)}
        >
          New Vote
        </button>
      </div>
      {newVote && (
        <div className="flex flex-col justify-center items-center gap-2 mt-4">
          <input
            type="text"
            className="px-4 py-2 border border-gray-300 rounded"
            placeholder="Enter Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            className="bg-blue-500 px-4 py-2 text-white rounded-lg"
            onClick={handleAddVote}
          >
            Add Vote
          </button>
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-4 mt-10">
        {votes.map((vote) => {
          const totalVote = vote.yes + vote.no || 1; // Avoid division by zero
          const yesPercent = (vote.yes * 100) / totalVote;
          const noPercent = (vote.no * 100) / totalVote;

          return (
            <div
              key={vote._id}
              className="flex flex-col px-4 py-2 border border-gray-400 gap-2 w-[500px] rounded-lg"
            >
              <h1 className="font-semibold">Q: {vote.question}</h1>
              <div
                className="relative flex justify-between items-center bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => handleAnswerInput(vote._id, 1)}
              >
                <div
                  className="absolute left-0 top-0 bg-green-300 h-full rounded-lg"
                  style={{ width: `${yesPercent}%` }}
                ></div>
                <p className="relative z-10 px-2 py-2">Yes</p>
                <p className="relative z-10 px-2 py-2">{vote.yes}</p>
              </div>
              <div
                className="relative flex justify-between items-center bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => handleAnswerInput(vote._id, 0)}
              >
                <div
                  className="absolute left-0 top-0 bg-red-300 h-full rounded-lg"
                  style={{ width: `${noPercent}%` }}
                ></div>
                <p className="relative z-10 px-2 py-2">No</p>
                <p className="relative z-10 px-2 py-2">{vote.no}</p>
              </div>
              <button
                className="bg-red-500 px-4 py-2 text-white rounded-lg mt-2"
                onClick={() => handleDeleteVote(vote._id)} // Delete vote when clicked
              >
                Delete Vote
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
