"""Simple CLI to query multiple LLMs via the ensemble."""
from bot.brain.ensemble import ask_ensemble


def main() -> None:
    import sys

    question = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else input("Question: ")
    answer = ask_ensemble(question)
    print(answer)


if __name__ == "__main__":
    main()
