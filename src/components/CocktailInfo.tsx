"use client";

import { useEffect, useState } from "react";

export default function CocktailInfo({ name }: { name: string }) {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (!name) return;
    fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        name
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.drinks && data.drinks.length > 0) {
          setInfo(data.drinks[0]);
        }
      });
  }, [name]);

  if (!info) return null;

  return (
    <div className="mt-4 border p-3 rounded bg-gray-50">
      <h3 className="font-bold">🍹 How to Mix {info.strDrink}</h3>
      {info.strDrinkThumb && (
        <img
          src={info.strDrinkThumb}
          alt={info.strDrink}
          className="w-32 h-32 object-cover rounded mt-2"
        />
      )}
      <p className="mt-2 text-sm">{info.strInstructions}</p>
      <ul className="list-disc ml-5 text-sm">
        {Object.keys(info)
          .filter((k) => k.startsWith("strIngredient") && info[k])
          .map((k, i) => (
            <li key={i}>{info[k]}</li>
          ))}
      </ul>
    </div>
  );
}
