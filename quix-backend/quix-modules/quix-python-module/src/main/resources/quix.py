class Quix:

    def __init__(self):
        import sys
        from py4j.java_gateway import JavaGateway
        from py4j.java_gateway import GatewayParameters
        self.gateway = JavaGateway(gateway_parameters=GatewayParameters(auto_convert=True, port=int(sys.argv[1])))
        self.bridge = self.gateway.entry_point

    def fields(self, *fields):
        self.bridge.fields(list(fields))

    def row(self, *row):
        self.bridge.row(list(row))

    def error(self, message):
        self.bridge.error(message)

    def info(self, message):
        self.bridge.info(message)
