class Quix:

    def __init__(self):
        import sys
        from py4j.java_gateway import JavaGateway
        from py4j.java_gateway import GatewayParameters
        self.gateway = JavaGateway(gateway_parameters=GatewayParameters(auto_convert=True, port=int(sys.argv[1])))
        self.bridge = self.gateway.entry_point
        self.query_id = sys.argv[2]
        self.user = sys.argv[3]

    def fields(self, *fields):
        self.bridge.tab_columns(self.query_id, list(fields))

    def row(self, *row):
        self.bridge.tab_row(self.query_id, list(row))

    def error(self, message):
        self.bridge.error(message)

    def info(self, message):
        self.bridge.info(message)

    def tab(self, name):
        return Tab(self.bridge, name)


class Tab:
    def __init__(self, bridge, name):
        self.bridge = bridge
        self.name = name

    def columns(self, *columns):
        self.bridge.tab_columns(self.name, list(columns))

    def row(self, *row):
        self.bridge.tab_row(self.name, list(row))

    def end(self):
        self.bridge.tab_end(self.name)
