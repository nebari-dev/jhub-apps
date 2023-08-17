import requests

API_URL = 'http://127.0.0.1:8000/hub/api'


class HubClient:
    def __init__(self, token):
        self.token = token

    def _headers(self):
        return {'Authorization': f'token {self.token}'}

    def get_users(self):
        r = requests.get(API_URL + '/users', headers=self._headers())
        r.raise_for_status()
        users = r.json()
        return users

    def create_server(self, username, servername="foobarlar"):
        url = f"/users/{username}/servers/{servername}"
        r = requests.post(API_URL + url, headers=self._headers())
        r.raise_for_status()
        server = r.json()
        return server

    def foo(self, username, servername="foobarlar"):
        url = f"/users/{username}/servers/{servername}"
        r = requests.post(API_URL + url, headers=self._headers())
        r.raise_for_status()
        server = r.json()
        return server
