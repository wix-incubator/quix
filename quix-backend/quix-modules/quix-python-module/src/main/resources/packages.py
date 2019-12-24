class Packages:

    def __init__(self, dir, index_url, extra_url):
        self.dir = dir
        self.index_url = index_url
        self.extra_url = extra_url

    def __get_installed_packages(self):
        try:
            with open(self.dir + '/packages') as f:
                return f.read().split(' ')
        except IOError:
            return []

    def __create_environment(self):
        import os.path
        ready_env = os.path.isfile(self.dir + '/env')

        if not ready_env:
            import venv
            # inherit system site packages for fast installation times
            # in `init` function pip will be used with '--upgrade' option to allow using different versions
            venv.create(self.dir, system_site_packages=True)

            open(self.dir + '/env', 'a').close()

    def __clean(self, packages):
        for package in packages:
            index = len(package)

            if '==' in package:
                index = package.find('==')
            elif '>' in package and '<' in package:
                greater = package.find('>')
                less = package.find('<')
                index = min(greater, less)
            elif '>' in package:
                index = package.find('>')
            elif '<' in package:
                index = package.find('<')
            yield package[0: index]

    def list(self):
        import subprocess
        from quix import Quix
        quix = Quix()

        process = subprocess.Popen(self.dir + '/bin/python3 -m pip list --format=freeze', shell=True, stdout=subprocess.PIPE)
        stdout = process.communicate()[0]

        reqs = sorted(stdout.decode('utf-8').strip().split('\n'))
        splitted = [req.split('==') for req in reqs]

        quix.fields('package', 'version')
        for (package, version) in splitted:
            quix.row(package, version)

    def install(self, *required_packages):
        installed_packages = self.__get_installed_packages()
        self.__create_environment()

        if not set(required_packages).issubset(installed_packages):
            exec (open(self.dir + '/bin/activator.py').read(), {'__file__': self.dir + '/bin/activator.py'})

            index_url_args = []
            extra_index_url_args = []

            if self.index_url:
                index_url_args = ['--index-url', self.index_url]
            if self.extra_url:
                extra_index_url_args = ['--extra-index-url', self.extra_url]

            pipargs = ['install'] + list(required_packages) + ['--prefix', self.dir, '--ignore-installed',
                                                               '--no-warn-script-location',
                                                               '--no-warn-conflicts'] + index_url_args + extra_index_url_args

            import subprocess
            import sys
            subprocess.check_call([sys.executable, '-m', 'pip'] + pipargs)

            packages_file = open(self.dir + '/packages', 'w+')
            packages = self.__clean(required_packages)
            packages_file.write(' '.join(list(packages) + installed_packages))
            packages_file.close()
        else:
            exec (open(self.dir + '/bin/activator.py').read(), {'__file__': self.dir + '/bin/activator.py'})

    def uninstall(self, *packages):
        self.__create_environment()
        installed_packages = self.__get_installed_packages()

        if set(packages).issubset(installed_packages):
            import subprocess
            import sys

            process = subprocess.Popen(self.dir + '/bin/python3 -m pip uninstall --yes ' + ' '.join(list(packages)),
                                       shell=True)
            process.wait()

            packages_file = open(self.dir + '/packages', 'w+')

            for package in packages:
                installed_packages.remove(package)
            packages_file.write(' '.join(installed_packages))
            packages_file.close()
