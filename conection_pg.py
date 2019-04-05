import psycopg2
import sys, os
import numpy as np
import pandas as pd
import pg as creds
import pandas.io.sql as psql

class Connection_pg:
    def __init__(self):
        self.string_connection = "host = " + creds.pgHost + " port = " + creds.pgPort + " dbname = " + creds.pgDataBase + " user = " + creds.pgUser + " password = " + creds.pgPassWord
        self.connection = psycopg2.connect(self.string_connection)
        self.cursor = self.connection.cursor()

    def load_data(self, sql_command):
        data = pd.read_sql(sql_command, self.connection)
        return data