export interface User {
  id: string;
  twitter?: string;
  goal: number;
  comment?: string;
  token: string;
  created_at: string;
  updated_at: string;
}

export const generateToken = () => {
  const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerLetters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allCharacters = upperLetters + lowerLetters + numbers;

  const password = [
    upperLetters[Math.floor(Math.random() * upperLetters.length)],
    upperLetters[Math.floor(Math.random() * upperLetters.length)],
    lowerLetters[Math.floor(Math.random() * lowerLetters.length)],
    lowerLetters[Math.floor(Math.random() * lowerLetters.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];

  for (let i = password.length; i < 16; i++) {
    password.push(
      allCharacters[Math.floor(Math.random() * allCharacters.length)]
    );
  }
  return password.toSorted(() => Math.random() - 0.5).join("");
};
