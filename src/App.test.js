import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import "@testing-library/jest-dom";
import App from "./App";
import Home from "./Home";
import PokeDex from "./PokeDex";

test("renders App component without crashing", () => {
  render(<App />);
});

describe("PokeDex Component", () => {
  test("renders Pokémon data after successful API call", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
          ],
        }),
    });
    render(<PokeDex />);
    await waitFor(() => {
      expect(screen.getByTestId("pokemon-name")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon"
    );
  });

  test("renders loading spinner while fetching data", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ results: [] }),
    });
    render(<PokeDex />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).toBeNull();
    });
  });

  test("opens modal with Pokémon details on click", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
          ],
        }),
    });
    render(<PokeDex />);
    await waitFor(() => {
      const pokemonItem = screen.getByTestId("pokemon-name");
      fireEvent.click(pokemonItem);
      expect(screen.getByText("Download")).toBeInTheDocument();
    });
  });

  describe("Home Component", () => {
    // Test case to check whether PokeDex renders without any issues
    test("renders PokeDex component", () => {
      render(
        <HashRouter>
          <PokeDex />
        </HashRouter>
      );
      const wrapperElement = screen.getByTestId("pokedex-wrapper");
      expect(wrapperElement).toBeInTheDocument();
    });

    test("checks background color of a component", () => {
      const { getByTestId } = render(<PokeDex />);
      const component = getByTestId("pokedex-wrapper");
      const computedStyle = window.getComputedStyle(component);
      const backgroundColor =
        computedStyle.getPropertyValue("background-color");
      expect(backgroundColor).toEqual("#282c34)");
    });
  });

  test("renders PokeDex component", () => {
    render(
      <HashRouter>
        <Home />
      </HashRouter>
    );
    const notReadyErrMsg = screen.getByTestId("not-ready");
    expect(notReadyErrMsg).toBeInTheDocument();
  });

  test("renders the home page", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const titlePage = screen.getByText(
      /Are you ready to be a pokemon master?/i
    );
    expect(titlePage).toBeInTheDocument();
  });

  // this func is to check whether image navigates to pokedex page
  test("to check whether image navigates to pokedex page", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const image = screen.getByAltText("logo");
    fireEvent.click(image);
    expect(window.location.pathname).toBe("/pokedex");
  });

  test('to display err message when input is not "Ready!"', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const inputElement = screen.getByRole("textbox");
    fireEvent.change(inputElement, { target: { value: "Not Ready!" } });
    const errMessage = screen.getByText("I am not ready yet!");
    expect(errMessage).toBeInTheDocument();
  });
});
