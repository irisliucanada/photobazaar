import { React, useState, useEffect } from "react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Axios from "axios";
import ArtworkListComponent from "../components/ArtworkList";

function Home() {
  const [topTags, setTopTags] = useState([]); // top 3 tags
  const [token, setToken] = useState(localStorage.getItem('accessToken'))
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (token) {
      Axios.get(`http://localhost:3001/api/users/auth`, { headers: { accessToken: token } })
        .then(response => {
          setToken(response.data.token);
          setUser(response.data.user)
          setUserId(response.data.user.id);
        }).catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  useEffect(() => {
    Axios.get("http://localhost:3001/api/tags").then((response) => {
      const tagList = response.data;
      // sort by count
      const sortedTagList = tagList.sort((a, b) => b.count - a.count);
      setTopTags(sortedTagList.slice(0, 3));
    })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  return <div>
    <Header />
    <div className="search p-3 m-5">
      <img className="w-full" src="./homepagebg.png" alt="photobazaar" ></img>
    </div>

    <div className="tags p-3 m-5 flex capitalize text-xl font-bold justify-center items-center">
      <div className="flex flex-col items-center justify-center pr-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center">top 3 tags:</div>
      <div className="items-center justify-center">
        {topTags.map((tag, index) => (
          <div key={index} className="font-serif capitalize p-1 text-sm inline ml-2 bg-sky-500/50 rounded-lg">
            {topTags[index].tag}
          </div>
        ))}
      </div>
    </div>

    <div className="artworks">
      <ArtworkListComponent userId={userId ? userId : null} page={"home"} />
    </div>
    <Footer />
  </div>;
}

export default Home;
