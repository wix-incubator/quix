def get_installed_packages(dir):
    try:
        with open(dir + '/packages') as f:
            return f.read().split(' ')
    except IOError:
        return []


def create_environment(dir):
    import sys
    import os.path
    ready_env = os.path.isfile(dir + '/env')

    if not ready_env:
        print('start creating virtual env for first time for dir ' + dir)

        if sys.version_info[1] == 6:
            import venv
            venv.create(dir, system_site_packages=True)
        if sys.version_info[1] == 7:
            import virtualenv
            virtualenv.create_environment(dir, system_site_packages=True)

        open(dir + '/env', 'a').close()
        print('done creating virtual env for first time for dir ' + dir)


def init(dir, required_packages, index_url, extra_index_url):
    installed_packages = get_installed_packages(dir)
    create_environment(dir)

    if installed_packages != required_packages:
        print('existing packages = [' + str(installed_packages) + '], required = [' + str(required_packages) + ']')
        exec (open(dir + '/bin/activator.py').read(), {'__file__': dir + '/bin/activator.py'})

        index_url_args = []
        extra_index_url_args = []

        if index_url:
            index_url_args = ['--index-url', index_url]
        if extra_index_url:
            extra_index_url_args = ['--extra-index-url', extra_index_url]

        pipargs = ['install'] + required_packages + ['--prefix', dir, '--upgrade', '--no-warn-script-location',
                                            '--no-warn-conflicts'] + index_url_args + extra_index_url_args
        try:
            from pip import main as pipmain
            pipmain.main(pipargs)
        except:
            from pip._internal import main as pipmain
            pipmain.main(pipargs)

        packages_file = open(dir + '/packages', 'w+')
        packages_file.write(' '.join(required_packages))
        packages_file.close()
        print('done installing modules ' + str(required_packages))
    else:
        exec (open(dir + '/bin/activator.py').read(), {'__file__': dir + '/bin/activator.py'})
