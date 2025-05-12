import sys

from .oauth2 import main

if __name__ == "__main__":
    # forward all args after “-m proxy”
    main(sys.argv[1:])
