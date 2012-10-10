.SILENT: all

TMP=.tmp
VERSION=1.0.0

copy= \
	mkdir -p $(TMP)/$(2) ; \
	cp -r $(1)/* $(TMP)/$(2) ;

all:
	sudo /usr/bin/make rootall

clean:
	sudo /usr/bin/make rootclean

rootall: rootclean ipk install 

rootclean:
	rm -fR ${TMP}
	rm -f com.palm.whatsapp_${VERSION}_all.ipk

ipk:
	mkdir -p ${TMP}
	$(call copy,"palm/activities","/etc/palm/activities/com.palm.service.whatsapp")
	$(call copy,"palm/db","/etc/palm/db/kinds")
	$(call copy,"palm/tempdb","/etc/palm/tempdb/kinds")
	$(call copy,"palm/accounts","/usr/palm/public/accounts/com.palm.whatsapp")
	$(call copy,"palm/dbus","/usr/share/dbus-1/system-services")
	$(call copy,"palm/roles","/usr/share/ls2/roles/prv")
	$(call copy,"palm/roles","/usr/share/ls2/roles/pub")
	$(call copy,"service","/usr/palm/services/com.palm.service.whatsapp")
	$(call copy,"app","/usr/palm/applications/com.palm.app.whatsapp.config")

	@echo "Package: com.palm.whatsapp\n\
Version: ${VERSION}\n\
Section: misc\n\
Priority: optional\n\
Architecture: all\n\
Maintainer: Bruno Orcha <gimcoo@gmail.com>\n\
Description: Whatsapp Synergy Service" > ${TMP}/control
	@echo "2.0" > ${TMP}/debian-binary

	cd ${TMP} && /opt/local/bin/gnutar --exclude-vcs -zcf data.tar.gz ./etc ./usr
	cd ${TMP} && /opt/local/bin/gnutar -zcf control.tar.gz ./control
	cd ${TMP} && ar -r ../com.palm.whatsapp_${VERSION}_all.ipk ./debian-binary ./data.tar.gz ./control.tar.gz

install:
	/usr/local/bin/novacom -d tcp put file:///tmp/com.palm.whatsapp_1.0.0_all.ipk < com.palm.whatsapp_1.0.0_all.ipk
	/usr/local/bin/novacom -d tcp run "file:///usr/bin/ipkg install /tmp/com.palm.whatsapp_1.0.0_all.ipk"


reboot:
	/usr/local/bin/novacom -d tcp run "file:///usr/bin/killall LunaSysMgr"

