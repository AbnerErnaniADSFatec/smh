import json 
import datetime
import georasters as gr
import pandas as pd
from connection_pg import Connection_pg
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
        try:
            conectar = Connection_pg()
            data = conectar.load_data("SELECT * FROM public.dcp_series_24")
            return jsonify(data.to_dict())
        except:
            return jsonify({ 'info' : 'Impossivel ler os dados das pcds' }) 

class PCD_info(Resource):
    def get(self, id):
        try:
            conectar = Connection_pg()
            data = conectar.load_data("SELECT * FROM public.dcp_series_24 WHERE id={}".format(str(id)))
            pcd = {
                "id" : str(data["id"][0]),
                "geom" : data["geom"][0],
                "alias" : data["alias"][0],
                "table_name" : data["table_name"][0]
            }
            return jsonify(pcd)
        except:
            return jsonify({ "alias" : "não existe" })
        

class PCD_history(Resource):
    def get(self, id):
        try:
            conectar = Connection_pg()
            data = conectar.load_data("SELECT table_name FROM public.dcp_series_24 WHERE id={}".format(str(id)))
            history = conectar.load_data("SELECT * FROM public.{}".format(str(data["table_name"][0])))
            return jsonify(history.to_dict())
        except:
            return jsonify({ 'info' : 'pcd não encontrada' })

class Merge_Daily(Resource):
    def get(self, date):
        try:
            data = gr.from_file("./dados/Daily/prec4kmclim_" + str(date)[0:2] + "_" + str(date)[2:4] + "_1998.tif")
            df = data.to_pandas().head(100)
            return jsonify(df.to_dict())
        except:
            return jsonify({ 'info' : 'data inválida para o merge daily' })

class Merge_Monthly(Resource):
    def get(self, date):
        try:
            mes = str(date)
            if int(mes) < 10: mes = "0" + mes
            data = gr.from_file("./dados/Monthly/prec4kmclim_masked_02_" + mes + "_1998.tif")
            df = data.to_pandas().head(100)
            return jsonify(df.to_dict())
        except:
            return jsonify({ 'info' : 'mês inválido para o merge monthly' })

class Merge_Monthly_Mean(Resource):
    def get(self):
        try:
            dataByMonth = []
            for mes in range(12):
                mes = str(mes + 1)
                if int(mes) < 10: mes = "0" + mes
                dataByMonth.append(gr.from_file("./dados/Monthly/prec4kmclim_masked_02_" + mes + "_1998.tif").to_pandas().head(100))
            df = {}
            for i in range(12):
                soma = 0
                for value in dataByMonth[i]["value"]:
                    soma = soma + float(value)
                df[str(i + 1)] = str(soma/100)
            return jsonify(df)
        except:
            return jsonify({ 'info' : 'no data in data series' })

class Merge_Yearly(Resource):
    def get(self, date):
        try:
            data = gr.from_file("./dados/Yearly/prec4km_masked_02_01_" + str(date) + ".tif")
            df = data.to_pandas().head(100)
            return jsonify(df.to_dict())
        except:
            return jsonify({ 'info' : 'ano inválido para merge yearly' })

class Merge_Yearly_Mean(Resource):
    def get(self):
        try:
            dataByYear = []
            for i in range(21):
                dataByYear.append(gr.from_file("./dados/Yearly/prec4km_masked_02_01_" + str(1998 + i) + ".tif").to_pandas().head(100))
            df = {}
            for i in range(21):
                soma = 0
                for value in dataByYear[i]["value"]:
                    soma = soma + float(value)
                df[str(1998 + i)] = str(soma/100)
            return jsonify(df)
        except:
            return jsonify({ 'info' : 'no data in data series' })

class MergeYearly(Resource):
    def get(self):
        try:
            conectar = Connection_pg()
            data = conectar.load_data("SELECT * FROM public.acumulado_merge_yearly_unique")
            print(data)
            return jsonify(data.to_dict())
        except:
            return jsonify({ 'info' : 'Impossivel ler acumulado anual' })

api.add_resource(PCD, '/pcd')
api.add_resource(PCD_info, '/pcd/<id>')
api.add_resource(PCD_history, '/pcd/<id>/history')
api.add_resource(Merge_Daily, '/merge_daily/<date>')
api.add_resource(Merge_Monthly, '/merge_monthly/<date>')
api.add_resource(Merge_Yearly, '/merge_yearly/<date>')
api.add_resource(MergeYearly, '/merge_yearly')
api.add_resource(Merge_Monthly_Mean, '/merge_monthly_mean')
api.add_resource(Merge_Yearly_Mean, '/merge_yearly_mean')

if __name__ == '__main__':
    app.run( port = 4863 )
