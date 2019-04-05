import json 
import datetime
import pandas as pd
from conection_pg import Connection_pg
from flask import Flask, request
from flask_cors import CORS, cross_origin
from flask_restful import Resource, Api
from flask_jsonpify import *
from flask.json import JSONEncoder
from datetime import date

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            if isinstance(obj, date):
                return obj.isoformat()
            iterable = iter(obj)
        except TypeError:
            pass
        else:
            return list(iterable)
        return JSONEncoder.default(self, obj)

app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
api = Api(app)
CORS(app)

@app.route("/")
def hello():
    return jsonify({'text':'Hello World!!!'})

class PCD(Resource):
    def get(self):
        conectar = Connection_pg()
        data = conectar.load_data("SELECT * FROM public.dcp_series_24")
        return data.to_json()

class PCD_info(Resource):
    def get(self, id):
        conectar = Connection_pg()
        data = conectar.load_data("SELECT * FROM public.dcp_series_24 WHERE id={}".format(str(id)))
        pcd = {}
        if not data.empty:
            pcd = {
                    "id" : str(data["id"][0]),
                    "geom" : data["geom"][0],
                    "alias" : data["alias"][0],
                    "table_name" : data["table_name"][0]
                }
        else:
            pcd = { "alias" : "não existe" }
        return jsonify(pcd)

class PCD_history(Resource):
    def get(self, id):
        conectar = Connection_pg()
        data = conectar.load_data("SELECT table_name FROM public.dcp_series_24 WHERE id={}".format(str(id)))
        history = None
        if not data.empty:
            history = conectar.load_data("SELECT * FROM public.{}".format(str(data["table_name"][0])))
        else:
            history = pd.DataFrame(data = ["pcd não encontrada"], index=range(0,1), columns=['datetime'])
        return history.to_json()
        
api.add_resource(PCD, '/pcd')
api.add_resource(PCD_info, '/pcd/<id>')
api.add_resource(PCD_history, '/pcd/<id>/history')

if __name__ == '__main__':
    app.run( port = 1524 )
