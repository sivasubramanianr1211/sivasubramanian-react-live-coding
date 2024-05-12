import { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import Modal from "react-modal";
import html2pdf from "html2pdf.js";
import Styles from "../src/styles/pokedex.module.scss";

interface Pokemon {
  name: string;
  url: string;
}

interface Stat {
  name: string;
  base_stat: number;
}

interface PokemonDetail extends Pokemon {
  stats: Stat[];
}

interface Stat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

function PokeDex() {
  const pokemonDetailRef = useRef<HTMLDivElement>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentPokemons, setCurrentPokemons] = useState<Pokemon[]>([]);
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | any>(null);
  const [pokemonPopup, setPokemonPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState("sort");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  // this func is to find the pokemons to show for the current selected page
  const toFindCurrentPokemons = (
    pokemonsData: Pokemon[],
    currentPage: number
  ) => {
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPokemons = pokemonsData.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    return currentPokemons;
  };

  // this useeffect is to trigger the api call to retrieve the pokemons array data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const apiCallFunc = async () => {
        try {
          const fetchData = await fetch("https://pokeapi.co/api/v2/pokemon");
          const responseData = await fetchData.json();
          setIsLoading(false);
          console.log(responseData);
          const pokemonsData = responseData?.results;
          const currentPokemons = toFindCurrentPokemons(
            pokemonsData,
            currentPage
          );
          setPokemons(pokemonsData);
          setCurrentPokemons(currentPokemons);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      apiCallFunc();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // this func is to open the modal popup for the selected pokemon
  const handleClick = async (pokemon: Pokemon) => {
    try {
      const pokemonDetailResponse = await fetch(pokemon.url);
      const pokemonDetailResponseData = await pokemonDetailResponse.json();
      setPokemonDetail(pokemonDetailResponseData);
    } catch (err) {}
    setPokemonPopup(true);
  };

  const customStyles = {
    content: {
      top: "2%",
      left: "25%",
      right: "auto",
      bottom: "2%",
      height: "100%",
      width: "50%",
      background: "black",
      color: "white",
    },
    overlay: { backgroundColor: "transparent", opacity: 0.9 },
  };

  //this function is used to handle the pagination btn click
  const handlePageBtnClick = (index: any) => {
    setCurrentPage(index + 1);
    const currentPageData = index + 1;
    const updatedPokemons = toFindCurrentPokemons(pokemons, currentPageData);
    setCurrentPokemons(updatedPokemons);
  };

  //this function is used to perform sorting of pokemon arr
  const sortPokemonArray = (
    pokemons: Pokemon[],
    attribute: keyof Pokemon,
    ascending: boolean
  ): Pokemon[] => {
    const sortedPokemons = [...pokemons];
    sortedPokemons.sort((a, b) => {
      const valueA = a[attribute];
      const valueB = b[attribute];
      if (valueA === valueB) {
        return 0;
      }
      if (ascending) {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });
    return sortedPokemons;
  };

  // this func is to handle the sorting based on the sort order
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSortOrder = e.target.value;
    const sortedPokemonsValue = sortPokemonArray(
      pokemons,
      "name",
      selectedSortOrder === "asc" ? true : false
    );
    const setCurrentSortedPokemons = sortedPokemonsValue.slice(0, 10);
    setSortOrder(selectedSortOrder);
    setPokemons(sortedPokemonsValue);
    setCurrentPokemons(setCurrentSortedPokemons);
  };

  //this function is used to perform pdf download based on display data in modal popup
  const handleDownloadPDF = (name: string | undefined) => {
    if (pokemonDetailRef.current && imageLoaded) {
      html2pdf()
        .from(pokemonDetailRef.current)
        .toPdf()
        .output("datauristring")
        .then((pdfString: string) => {
          const pdfElement = document.createElement("a");
          pdfElement.href = pdfString;
          pdfElement.download = `${name}_pokemon_detail.pdf`;
          pdfElement.click();
        });
    }
  };

  //this function is used to perform search and filter the pokemons in pokemon arr
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    const { value } = event.target;
    setSearchText(value);
    const filtered = pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(value.toLowerCase())
    );

    setCurrentPokemons(filtered);
    if (value === "") {
      setCurrentPokemons(pokemons.slice(0, 10));
    }
  };

  return (
    <div data-testid="pokedex-wrapper">
      {isLoading ? (
        <ReactLoading
          data-testid="loading-spinner"
          type={"spin"}
          color={"#6c757d"}
          height={100}
          width={100}
        />
      ) : (
        <>
          <h1 data-testid="header-title" className={Styles["header-text"]}>
            Welcome to pokedex !
          </h1>
          <div className={Styles["pagination"]}>
            <input
              placeholder="Search..."
              className={Styles["input-field-data"]}
              type="text"
              value={searchText}
              name="name"
              onChange={handleSearchChange}
            />
            <select
              className={Styles["select-field-data"]}
              value={sortOrder}
              onChange={handleSortChange}
            >
              <option disabled value="sort">
                Sort
              </option>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
            </select>
          </div>
          <ul className={Styles["pokemon-container"]}>
            {currentPokemons.map((pokemon, index) => (
              <li
                data-testid="pokemon-name"
                key={index}
                onClick={() => handleClick(pokemon)}
                className={Styles["list-pokemon"]}
              >
                {`${pokemon.name.charAt(0).toUpperCase()}${pokemon.name.slice(
                  1
                )}`}
              </li>
            ))}
          </ul>
          <div className={Styles["pagination"]}>
            {Array.from({ length: 2 }).map((_, index) => (
              <button key={index} onClick={() => handlePageBtnClick(index)}>
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      {pokemonPopup && (
        <Modal
          isOpen={pokemonPopup}
          contentLabel={pokemonDetail?.name || ""}
          onRequestClose={() => {
            setPokemonDetail(null);
          }}
          style={customStyles}
        >
          <div>
            <div className={Styles["modal-header"]}>
              {pokemonDetail.name.charAt(0).toUpperCase()}
              {pokemonDetail.name.slice(1)}
              <span className={Styles["modal-header"]}>
                <span
                  className={Styles["download-icon"]}
                  onClick={() => handleDownloadPDF(pokemonDetail?.name)}
                >
                  Download
                </span>{" "}
                <span
                  className={Styles["close-icon"]}
                  onClick={() => {
                    setPokemonPopup(false);
                  }}
                >
                  x
                </span>
              </span>
            </div>
            <div ref={pokemonDetailRef} id="pokemon-detail-data">
              <img
                src={pokemonDetail?.sprites?.front_default}
                alt=""
                height={250}
                width={250}
                style={{ cursor: "pointer" }}
                onLoad={() => setImageLoaded(true)}
              />
              <table className={Styles["pokemon-table"]}>
                <thead>
                  <tr>
                    <th className={Styles["pokemon-th"]}>Stat Name</th>
                    <th className={Styles["pokemon-th"]}>Base Stat</th>
                  </tr>
                </thead>
                <tbody>
                  {pokemonDetail?.stats.map((stat: any) => (
                    <tr key={stat.stat.name}>
                      <td className={Styles["pokemon-th"]}>{stat.stat.name}</td>
                      <td className={Styles["pokemon-th"]}>{stat.base_stat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* */}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PokeDex;

// ***************Commenting the requirements mentioned in this file*****************
//
//         <h2>Requirement:</h2>
//         <ul>
//           <li>
//             Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex,
//             and show a list of pokemon name.
//           </li>
//           <li>Implement React Loading and show it during API call</li>
//           <li>
//             When hover on the list item, change the item color to yellow.
//           </li>
//           <li>When clicked the list item, show the modal below</li>
//           <li>
//             Add a search bar on top of the bar for searching, search will run
//             on keyup event
//           </li>
//           <li>Implement sorting and pagination</li>
//           <li>Commit your codes after done</li>
//           <li>
//             If you do more than expected (E.g redesign the page / create a
//             chat feature at the bottom right), it would be good.
//           </li>
//         </ul>
// <ul>
//           <li>Show the sprites front_default as the pokemon image</li>
//         <li>
//         Show the stats details - only stat.name and base_stat is
//       required in tabular format
//   </li>
//              <li>Create a bar chart based on the stats above</li>
//            <li>
//            Create a button to download the information generated in this
//           modal as pdf. (images and chart must be included)
//       </li>
//   </ul>
