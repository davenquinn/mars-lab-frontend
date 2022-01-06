all: dist

dist:
	scripts/docker-dist

.PHONY: dist