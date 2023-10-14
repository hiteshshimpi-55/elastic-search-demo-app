import { useState } from "react";
import SearchBox from "./components/SearchBox";
import ZipList from "./components/ZipList";
import "./App.css";
import { useEffect } from "react";
import axios from 'axios';

function App() {
  const [queryText, setQueryText] = useState('');
  const [zips, setZips] = useState([])

  useEffect(() => {
    axios.get(`http://localhost:3030/elastic?text=${queryText}`).then((result) => {
      const { records } = result.data;
      if (records && records.hits && Array.isArray(records.hits.hits)) {
        const tempZips = records.hits.hits.map((hit) => {
          const { _source } = hit;
          return {
            id: _source.id,
            city: _source.city,
            state: _source.state,
          };
        });
        setZips(tempZips);
      } else {
        // Handle the case where the response structure is not as expected
        console.error("Invalid response format");
      }
    });    
  }, [queryText])
  
  return (
    <div className="App">
      <SearchBox placeholder="Search Elasticsearch" setQueryText={setQueryText} />
      <ZipList zips={zips} />
    </div>
  );
}

export default App;
