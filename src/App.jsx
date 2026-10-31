
import { useState } from "react";
import axios from "axios";
import "./App.css";

const currencies = [
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "PKR", flag: "🇵🇰", name: "Pakistani Rupee" },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
  { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
  { code: "CNY", flag: "🇨🇳", name: "Chinese Yuan" },
  { code: "TRY", flag: "🇹🇷", name: "Turkish Lira" },
];

function App() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCurrency = (code) =>
    currencies.find((currency) => currency.code === code);

  const convertCurrency = async (e) => {
    e?.preventDefault();

    const numericAmount = Number(amount);

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      setResult(null);
      setRate(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setRate(null);

    try {
      let exchangeRate = 1;

      if (from !== to) {
        const response = await axios.get(
          `https://open.er-api.com/v6/latest/${from}`
        );

        if (response.data.result !== "success") {
          throw new Error("Unable to fetch exchange rates");
        }

        exchangeRate = response.data.rates[to];

        if (!Number.isFinite(exchangeRate)) {
          throw new Error("Currency rate unavailable");
        }
      }

      setRate(exchangeRate);
      setResult(numericAmount * exchangeRate);
    } catch (err) {
      setError("Unable to get exchange rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setRate(null);
    setError("");
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="app">
      <div className="circle circle-one"></div>
      <div className="circle circle-two"></div>

      <main className="converter-card">
        <header className="header">
          <div className="logo">⇄</div>

          <div>
            <h1>
              Currency <span>Converter</span>
            </h1>
            <p>
              Convert currencies with the latest available
              exchange rates
            </p>
          </div>
        </header>

        <form onSubmit={convertCurrency}>
          <div className="converter-box">
            <div className="currency-grid">
              <div className="currency-field">
                <label htmlFor="from">From</label>

                <div className="select-wrapper">
                  <span className="flag">
                    {getCurrency(from)?.flag}
                  </span>

                  <select
                    id="from"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      setResult(null);
                    }}
                  >
                    {currencies.map((currency) => (
                      <option
                        key={currency.code}
                        value={currency.code}
                      >
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setResult(null);
                  }}
                  placeholder="Enter amount"
                />
              </div>

              <div className="swap-container">
                <button
                  type="button"
                  className="swap-btn"
                  onClick={swapCurrencies}
                  aria-label="Swap currencies"
                >
                  ⇄
                </button>
              </div>

              <div className="currency-field">
                <label htmlFor="to">To</label>

                <div className="select-wrapper">
                  <span className="flag">
                    {getCurrency(to)?.flag}
                  </span>

                  <select
                    id="to"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setResult(null);
                    }}
                  >
                    {currencies.map((currency) => (
                      <option
                        key={currency.code}
                        value={currency.code}
                      >
                        {currency.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="output-input">
                  {result === null
                    ? "0.00"
                    : formatNumber(result)}
                </div>
              </div>
            </div>

            <button
              className="convert-btn"
              type="submit"
              disabled={loading}
            >
              <span>⟳</span>
              {loading ? "Converting..." : "Convert"}
            </button>

            <div className="result-card" aria-live="polite">
              <div className="result-icon">≋</div>

              <div className="result-content">
                <h3>Conversion Result</h3>

                <h2>
                  {result === null
                    ? "Your result will appear here"
                    : `${formatNumber(Number(amount))} ${from} = ${formatNumber(result)} ${to}`}
                </h2>

                {rate !== null && (
                  <p>
                    1 {from} = {rate.toFixed(4)} {to}
                  </p>
                )}
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="footer-note">
              ⟳ Rates are based on the latest available data
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;
