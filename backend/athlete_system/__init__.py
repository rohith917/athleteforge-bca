# PyMySQL fallback for Windows when mysqlclient is unavailable
try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass