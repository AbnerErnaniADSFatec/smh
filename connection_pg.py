import psycopg2
import sys, os
import numpy as np
import pandas as pd
import pg as creds
import pandas.io.sql as psql
from sqlalchemy import create_engine

class Connection_pg:
    def __init__(self):
        try:
            self.string_connection = (
                "host = " + creds.pgHost + 
                " port = " + creds.pgPort + 
                " dbname = " + creds.pgDataBase + 
                " user = " + creds.pgUser + 
                " password = " + creds.pgPassWord
            )
            self.connection = psycopg2.connect(self.string_connection)
            self.cursor = self.connection.cursor()
            self.engine = create_engine(
                'postgresql+psycopg2://' +
                creds.pgUser + ':' + creds.pgPassWord +
                '@' + creds.pgHost + ':' + creds.pgPort +
                '/' + creds.pgDataBase
            )
            print("Conexao criada com sucesso!")
        except:
            print("Impossivel criar conexao!")
        
    def load_data(self, sql_command):
        try:
            data_frame = pd.read_sql(sql_command, self.connection)# self.connection)
            print("Leitura feita com sucesso : " + sql_command)
            return data_frame
        except:
            print("Impossivel ler : " + sql_command)
            return None
            
    def save_data(self, table_name, data_frame):
        try:
            data_frame.to_sql(name = table_name, con = self.engine, if_exists = 'replace', index = False)
            self.connection.commit()
            print("Salvo: " + table_name)
            print(data_frame)
        except:
            print("Impossivel ler" + table_name)
            print(data_frame)

    def getConn(self):
        return self.connection
        
    def getCursor(self):
        return self.cursor

        