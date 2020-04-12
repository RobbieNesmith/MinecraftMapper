import json
from flask import Flask, request, jsonify, render_template, redirect, url_for
import os
import psycopg2

DB_NAME = "nethernetwork.db"
DB_URL = os.environ["DATABASE_URL"]

app = Flask(__name__)

@app.before_first_request
def init_tables():
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT table_name from information_schema.tables")
        existing_tables = cursor.fetchall()
        existing_tables = [a[0] for a in existing_tables]
        if "vertices" not in existing_tables:
            cursor.execute("CREATE TABLE vertices (id serial primary key, name text, netherx real, netherz real, overx real, overz real, description varchar)")
        if "paths" not in existing_tables:
            cursor.execute("CREATE TABLE paths (id serial primary key, firstx real, firstz real, secondx real, secondz real)")
        if "villagers" not in existing_tables:
            cursor.execute("CREATE TABLE villagers (id serial primary key, locationid integer NOT NULL, name text, type text, FOREIGN KEY(locationid) REFERENCES vertices(id))")
        if "trades" not in existing_tables:
            cursor.execute("CREATE TABLE trades (id serial primary key, villagerid integer NOT NULL, item1 varchar, item2 varchar, item3 varchar, item1amt integer, item2amt integer, item3amt integer, enchantment text, FOREIGN KEY(villagerid) REFERENCES villagers(id))")
        dbconn.commit()
        cursor.close()

@app.route("/", methods=["GET"])
def map_page():
    return render_template("netherbuilder.html")

def _list_vertices():
    verts = []
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from vertices")
        verts = cursor.fetchall()
        verts = [{"id": v[0], "name": v[1], "netherCoords": [v[2], v[3]], "overworldCoords": [v[4], v[5]], "description": v[6]} for v in verts]
        cursor.close()
    return verts

def _get_vertex(vert_id):
    vertex = {}
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from vertices where id=%s", (vert_id,))
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
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO vertices(name, netherx, netherz, overx, overz, description) values (%s, %s, %s, %s, %s, %s)", (name, netherx, netherz, overx, overz, description))
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
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE vertices SET name=%s, netherx=%s, netherz=%s, overx=%s, overz=%s, description=%s WHERE id=%s", (name, netherx, netherz, overx, overz, description, id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/vertices/delete", methods=["GET", "POST"])
def delete_vertex():
    vert_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="vertices", id=vert_id)
    else:
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM vertices WHERE id=%s", (vert_id,))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/list", methods=["GET"])
def get_all_paths():
    paths = []
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
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
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO paths(firstx, firstz, secondx, secondz) values (%s, %s, %s, %s)", (firstx, firstz, secondx, secondz))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/edit", methods=["GET", "POST"])
def edit_path():
    path_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        path = {}
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM paths WHERE id=%s", (path_id))
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
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE paths SET firstx=%s, firstz=%s, secondx=%s, secondz=%s WHERE id=%s", (firstx, firstz, secondx, secondz, path_id))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

@app.route("/api/paths/delete", methods=["GET", "POST"])
def delete_path():
    path_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="paths", id=path_id)
    else:
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM paths WHERE id=%s", (path_id,))
            dbconn.commit()
            cursor.close()
        return redirect(url_for("map_page"))

def _get_villagers_for_vertex(vert_id):
    villagers = []
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from villagers where locationid=%s", (vert_id,))
        villagers = cursor.fetchall()
        cursor.close()
        villagers = [{"id": v[0], "locationId": v[1], "name": v[2], "type": v[3]} for v in villagers]
        for villager in villagers:
            villager["trades"] = get_all_trades_for_villager(villager["id"])
    return villagers

def _get_villager(villager_id):
        villager = {}
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM villagers WHERE id=%s", (villager_id,))
            v = cursor.fetchone()
            cursor.close()
            if v:
                villager = {"id": v[0], "locationId": v[1], "name": v[2], "type": v[3], "trades": []}
        return villager 

@app.route("/api/villagers/list", methods=["GET"])
def get_all_villagers():
    villagers = []
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
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
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from trades where villagerid=%s", (villager_id,))
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
        villager_result = {}
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO villagers(Id, locationid, name, type) values (DEFAULT, %s, %s, %s) returning *", (locationid, name, type))
            insert_result = cursor.fetchone()
            villager_result = {"id": insert_result[0], "locationid": insert_result[1], "name": insert_result[2], "type": insert_result[3], "trades": []}
            dbconn.commit()
            villager_id = cursor.lastrowid
            cursor.close()
        return jsonify(villager_result)   

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
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE villagers SET locationid=%s, name=%s, type=%s WHERE id=%s", (locationid, name, type, villager_id))
            dbconn.commit()
            cursor.close()
        return jsonify(_get_villager(villager_id))

@app.route("/api/villagers/delete", methods=["GET", "POST"])
def delete_villager():
    villager_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="villagers", id=villager_id)
    else:
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM villagers WHERE id=%s", (villager_id,))
            dbconn.commit()
            cursor.close()
        return jsonify({"id": villager_id})

@app.route("/api/trades/list", methods=["GET"])
def get_all_trades():
    trades = []
    with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
        cursor = dbconn.cursor()
        cursor.execute("SELECT * from trades")
        trades = cursor.fetchall()
        cursor.close()
        trades = [{"id": t[0], "villagerId": t[1], "item1": t[2], "item2": t[3], "item3": t[4], "item1amt": t[5], "item2amt": t[6], "item3amt": t[7], "enchantment": t[8]} for t in trades]
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
        enchantment = request.form.get("enchantment")
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("INSERT INTO trades(villagerid, item1, item2, item3, item1amt, item2amt, item3amt, enchantment) values (%s, %s, %s, %s, %s, %s, %s, %s)", (villagerid, item1, item2, item3, item1amt, item2amt, item3amt, enchantment))
            dbconn.commit()
            cursor.close()
        return jsonify(get_all_trades_for_villager(villagerid))

@app.route("/api/trades/edit", methods=["GET", "POST"])
def edit_trade():
    trade_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        trade = {}
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("SELECT * FROM trades WHERE id=%s", (trade_id,))
            t = cursor.fetchone()
            cursor.close()
            if t:
                trade = {"id": t[0], "villagerId": t[1], "item1": t[2], "item2": t[3], "item3": t[4], "item1amt": t[5], "item2amt": t[6], "item3amt": t[7], "enchantment": t[8]}
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
        enchantment = request.form.get("enchantment")
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("UPDATE trades SET villagerid=%s, item1=%s, item2=%s, item3=%s, item1amt=%s, item2amt=%s, item3amt=%s, enchantment=%s WHERE id=%s", (villagerid, item1, item2, item3, item1amt, item2amt, item3amt, enchantment, trade_id))
            dbconn.commit()
            cursor.close()
        return jsonify(get_all_trades_for_villager(villagerid))

@app.route("/api/trades/delete", methods=["GET", "POST"])
def delete_trade():
    trade_id = request.form.get("id") or request.args.get("id")
    if request.method == "GET":
        return render_template("delete_entity.html", entity="trades", id=trade_id)
    else:
        with psycopg2.connect(DB_URL, sslmode='require') as dbconn:
            cursor = dbconn.cursor()
            cursor.execute("DELETE FROM trades WHERE id=%s", (trade_id,))
            dbconn.commit()
            cursor.close()
        return jsonify(trade_id)

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
