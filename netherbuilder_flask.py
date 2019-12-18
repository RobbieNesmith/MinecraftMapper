import json
import sqlite3
from flask import Flask, request, jsonify, render_template, redirect, url_for

DB_NAME = "nethernetwork.db"

app = Flask(__name__)

def init_tables():
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT name from sqlite_master WHERE type='table';")
        existing_tables = cursor.fetchall()
        existing_tables = [a[0] for a in existing_tables]
        if "vertices" not in existing_tables:
            cursor.execute("CREATE TABLE vertices (id integer primary key, name text, netherx real, netherz real, overx real, overz real, description string)")
        if "paths" not in existing_tables:
            cursor.execute("CREATE TABLE paths (id integer primary key, firstx real, firstz real, secondx real, secondz real)")
        if "villagers" not in existing_tables:
            cursor.execute("CREATE TABLE villagers (id integer primary key, locationid integer NOT NULL, name text, type text, FOREIGN KEY(locationid) REFERENCES vertices(id))")
        if "trades" not in existing_tables:
            cursor.execute("CREATE TABLE trades (id integer primary key, villagerid integer NOT NULL, item1 string, item2 string, item3 string, item1amt integer, item2amt integer, item3amt integer, FOREIGN KEY(villagerid) REFERENCES villagers(id))")
        dbconn.commit()
        cursor.close()

@app.route("/", methods=["GET"])
def map_page():
    return render_template("netherbuilder.html")

def _list_vertices():
    verts = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from vertices")
        verts = cursor.fetchall()
        verts = [{"id": v[0], "name": v[1], "netherCoords": [v[2], v[3]], "overworldCoords": [v[4], v[5]], "description": v[6]} for v in verts]
        cursor.close()
    return verts

def _get_vertex(vert_id):
    vertex = {}
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from vertices where id=?", (vert_id,))
        v = cursor.fetchone()
        if v:
            vertex = {"id": v[0], "name": v[1], "netherCoords": [v[2], v[3]], "overworldCoords": [v[4], v[5]], "description": v[6]}
        cursor.close()
    return vertex

@app.route("/api/vertices/list", methods=["GET"])
def get_all_vertices():
    verts = _list_vertices()
    return jsonify({"vertices": verts})

@app.route("/api/vertices/add", methods=["GET", "POST"])
def add_vertex():
    if request.method == "GET":
        return render_template("add_vertex.html")
    else:
        name = request.form.get("name")
        netherx = request.form.get("netherx")
        netherz = request.form.get("netherz")
        overx = request.form.get("overx")
        overz = request.form.get("overz")
        description = request.form.get("description")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO vertices(name, netherx, netherz, overx, overz, description) values (?, ?, ?, ?, ?, ?)", (name, netherx, netherz, overx, overz, description))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/vertices/edit", methods=["GET", "POST"])
def edit_vertex():
    vert_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        vertex = _get_vertex(vert_id)
        if vertex:
            return render_template("edit_vertex.html", vertex=vertex)
        else:
            return "Invalid ID"
    else:
        id = request.form.get("id")
        name = request.form.get("name")
        netherx = request.form.get("netherx")
        netherz = request.form.get("netherz")
        overx = request.form.get("overx")
        overz = request.form.get("overz")
        description = request.form.get("description")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE vertices SET name=?, netherx=?, netherz=?, overx=?, overz=?, description=? WHERE id=?", (name, netherx, netherz, overx, overz, description, id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/vertices/delete", methods=["GET", "POST"])
def delete_vertex():
    vert_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="vertices", id=vert_id)
    else:
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM vertices WHERE id=?", (vert_id,))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/list", methods=["GET"])
def get_all_paths():
    paths = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from paths")
        paths = cursor.fetchall()
        paths = [{"id": p[0], "start": [p[1], p[2]], "end": [p[3], p[4]]} for p in paths]
        cursor.close()
    return jsonify({"paths": paths})

@app.route("/api/paths/add", methods=["GET", "POST"])
def add_path():
    if request.method == "GET":
        return render_template("add_path.html")
    else:
        firstx = request.form.get("firstx")
        firstz = request.form.get("firstz")
        secondx = request.form.get("secondx")
        secondz = request.form.get("secondz")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO paths(firstx, firstz, secondx, secondz) values (?, ?, ?, ?)", (firstx, firstz, secondx, secondz))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/edit", methods=["GET", "POST"])
def edit_path():
    path_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        path = {}
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM paths WHERE id=?", (path_id))
            p = cursor.fetchone()
            cursor.close()
            if p:
                path = {"id": p[0], "startX": p[1], "startZ": p[2], "endX": p[3], "endZ": p[4]}
        if path:
            return render_template("edit_path.html", path=path)
        else:
            return "Invalid ID"
    else:
        firstx = request.form.get("firstx")
        firstz = request.form.get("firstz")
        secondx = request.form.get("secondx")
        secondz = request.form.get("secondz")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE paths SET firstx=?, firstz=?, secondx=?, secondz=? WHERE id=?", (firstx, firstz, secondx, secondz, path_id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/delete", methods=["GET", "POST"])
def delete_path():
    path_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="paths", id=path_id)
    else:
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM paths WHERE id=?", (path_id,))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

def _get_villagers_for_vertex(vert_id):
    villagers = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from villagers where locationid=?", (vert_id,))
        villagers = cursor.fetchall()
        cursor.close()
        villagers = [{"id": v[0], "locationId": v[1], "name": v[2], "type": v[3]} for v in villagers]
        for villager in villagers:
            villager["trades"] = get_all_trades_for_villager(villager["id"])
    return villagers

def _get_villager(villager_id):
        villager = {}
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM villagers WHERE id=?", (villager_id,))
            v = cursor.fetchone()
            cursor.close()
            if v:
                villager = {"id": v[0], "locationId": v[1], "name": v[2], "type": v[3], "trades": []}
        return villager 

@app.route("/api/villagers/list", methods=["GET"])
def get_all_villagers():
    villagers = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from villagers")
        villagers = cursor.fetchall()
        cursor.close()
        villagers = [{"id": v[0], "locationId": v[1], "name": v[2], "type": v[3]} for v in villagers]
        for villager in villagers:
            villager["trades"] = get_all_trades_for_villager(villager["id"])
    return jsonify({"villagers": villagers})

def get_all_trades_for_villager(villager_id):
    trades = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from trades where villagerid=?", (villager_id,))
        trades = cursor.fetchall()
        cursor.close()
        trades = [{"id": t[0], "villagerId": t[1], "item1": t[2], "item2": t[3], "item3": t[4], "item1amt": t[5], "item2amt": t[6], "item3amt": t[7]} for t in trades]
    return trades

@app.route("/api/villagers/add", methods=["GET", "POST"])
def add_villager():
    if request.method == "GET":
        return render_template("add_villager.html")
    else:
        locationid = request.form.get("locationid")
        name = request.form.get("name")
        type = request.form.get("type")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO villagers(locationid, name, type) values (?, ?, ?)", (locationid, name, type))
            dbconn.commit()
            villager_id = cursor.lastrowid
            cursor.close()
        return jsonify(_get_villager(villager_id))   

@app.route("/api/villagers/edit", methods=["GET", "POST"])
def edit_villager():
    villager_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        villager = _get_villager(villager_id)
        if villager:
            return render_template("edit_villager.html", villager=villager)
        else:
            return "Invalid ID"
        return render_template("edit_villager.html")
    else:
        locationid = request.form.get("locationid")
        name = request.form.get("name")
        type = request.form.get("type")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE villagers SET locationid=?, name=?, type=? WHERE id=?", (locationid, name, type, villager_id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/villagers/delete", methods=["GET", "POST"])
def delete_villager():
    villager_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="villagers", id=villager_id)
    else:
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM villagers WHERE id=?", (villager_id,))
            dbconn.commit()
            cursor.close()
        return jsonify({"id": villager_id})

@app.route("/api/trades", methods=["GET"])
def get_all_trades():
    trades = []
    with sqlite3.connect(DB_NAME) as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from trades")
        trades = cursor.fetchall()
        cursor.close()
        trades = [{"id": t[0], "villagerId": t[1], "item1": t[2], "item2": t[3], "item3": t[4], "item1amt": t[5], "item2amt": t[6], "item3amt": t[7]} for t in trades]
    return jsonify({"trades": trades})

@app.route("/api/trades/add", methods=["GET", "POST"])
def add_trade():
    if request.method == "GET":
        return render_template("add_trade.html")
    else:
        villagerid = request.form.get("villagerid")
        item1 = request.form.get("item1")
        item2 = request.form.get("item2")
        item3 = request.form.get("item3")
        item1amt = request.form.get("item1amt")
        item2amt = request.form.get("item2amt")
        item3amt = request.form.get("item3amt")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO trades(villagerid, item1, item2, item3, item1amt, item2amt, item3amt) values (?, ?, ?, ?, ?, ?, ?)", (villagerid, item1, item2, item3, item1amt, item2amt, item3amt))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("get_all_trades"))

@app.route("/api/trades/edit", methods=["GET", "POST"])
def edit_trade():
    trade_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        trade = {}
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM trades WHERE id=?", (trade_id,))
            t = cursor.fetchone()
            cursor.close()
            if t:
                trade = {"id": t[0], "villagerId": t[1], "item1": t[2], "item2": t[3], "item3": t[4], "item1amt": t[5], "item2amt": t[6], "item3amt": t[7]}
        if trade:
            return render_template("edit_trade.html", trade=trade)
        else:
            return "Invalid ID"
        return render_template("edit_trade.html")
    else:
        villagerid = request.form.get("villagerid")
        item1 = request.form.get("item1")
        item2 = request.form.get("item2")
        item3 = request.form.get("item3")
        item1amt = request.form.get("item1amt")
        item2amt = request.form.get("item2amt")
        item3amt = request.form.get("item3amt")
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE trades SET villagerid=?, item1=?, item2=?, item3=?, item1amt=?, item2amt=?, item3amt=? WHERE id=?", (villagerid, item1, item2, item3, item1amt, item2amt, item3amt, trade_id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/trades/delete", methods=["GET", "POST"])
def delete_trade():
    trade_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="trades", id=trade_id)
    else:
        with sqlite3.connect(DB_NAME) as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM trades WHERE id=?", (trade_id,))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/trades", methods=["GET"])
def list_trades_for_vertex():
    itemJson = "{}"
    with open("itemDict.json") as itemDict:
        itemJson = itemDict.read()
    
    vert_id = request.args.get("id")
    
    vertex = _get_vertex(vert_id)
    villagers = _get_villagers_for_vertex(vert_id)
    
    return render_template("tradelist.html", vertex=vertex, itemDict=itemJson, villagers=json.dumps(villagers))

if __name__ == "__main__":
    init_tables()
    app.run("0.0.0.0", 8080)
